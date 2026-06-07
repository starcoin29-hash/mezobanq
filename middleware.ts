// middleware.ts
// Clerk middleware manages auth sessions
// We no longer hard-redirect on dashboard routes —
// the dashboard layout renders an inline sign-in instead
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(async (auth, request) => {
  // DEV BYPASS: Skip auth if configured for local testing
  if (process.env.DEV_BYPASS_AUTH === "true") {
    return;
  }

  // We intentionally do NOT call auth.protect() for dashboard routes.
  // The dashboard layout checks currentUser() and shows an inline
  // sign-in component if the user is not authenticated.
  // This prevents the jarring redirect to a separate /sign-in page.

  // Protect only API routes that absolutely need auth
  if (request.nextUrl.pathname.startsWith("/api/gift-cards")) {
    // API routes still need hard auth — return 401 if not logged in
    // This is handled inside the route handler itself
  }
});

// Configure which routes middleware runs on
// We EXCLUDE static files and internal Next.js routes
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};