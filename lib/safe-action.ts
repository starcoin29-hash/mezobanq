// lib/safe-action.ts
// Creates typed action clients with built-in error handling

import { createSafeActionClient } from "next-safe-action";
import { currentUser } from "@clerk/nextjs/server";
import { rateLimiter } from "@/lib/redis";
import { headers } from "next/headers";

// Public actions -- no authentication required
export const actionClient = createSafeActionClient({
  // Transform server errors into user-friendly messages
  // Never expose raw error details to the client
  handleServerError(error: Error) {
    console.error("[Server Action Error]:", error);
    return error.message || "Something went wrong. Please try again.";
  },
});

// Extends the base client with user authentication middleware
// Any action using this client automatically gets the user ID in ctx
export const authActionClient = actionClient.use(async ({ next }) => {
  // DEV BYPASS: use a fake user for local testing
  if (process.env.DEV_BYPASS_AUTH === "true") {
    return next({
      ctx: {
        userId: "dev_bypass_user",
        userEmail: "dev@mezobanq.local",
      },
    });
  }

  const user = await currentUser();

  if (!user) {
    throw new Error("You must be logged in to perform this action.");
  }

  // The 'ctx' object is passed to every action using this client
  // It gives the action the user's ID and email without re-fetching
  return next({
    ctx: {
      userId: user.id,
      userEmail: user.emailAddresses[0]?.emailAddress ?? "",
    },
  });
});

// Like authActionClient but also rate-limits requests per IP address
// Use this for expensive operations: borrow, repay, create gift card
export const rateLimitedActionClient = authActionClient.use(
  async ({ next }) => {
    const headersList = await headers();

    // Get the user's IP address from the request headers
    const ip =
      headersList.get("x-forwarded-for") ??
      headersList.get("x-real-ip") ??
      "127.0.0.1";

    const { success, remaining } = await rateLimiter.limit(ip);

    if (!success) {
      throw new Error(
        `Rate limit exceeded. Please wait a moment before trying again.`
      );
    }

    return next();
  }
);
