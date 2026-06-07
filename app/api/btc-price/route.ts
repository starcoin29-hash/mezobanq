// app/api/btc-price/route.ts
import { NextResponse } from "next/server";
import { redis, CACHE_KEYS } from "@/lib/redis";

export async function GET() {
  try {
    // Check cache first
    const cached = await redis.get<number>(CACHE_KEYS.btcPrice);
    if (cached) {
      return NextResponse.json({ price: cached, cached: true });
    }

    // Fetch from CoinGecko (free tier, no API key needed)
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
      { next: { revalidate: 30 } } // Next.js fetch cache
    );
    const data = await response.json();
    const price = data.bitcoin.usd as number;

    // Cache for 30 seconds
    await redis.setex(CACHE_KEYS.btcPrice, 30, price);

    return NextResponse.json({ price, cached: false });
  } catch {
    // If everything fails, return a fallback price
    return NextResponse.json({ price: 65000, cached: false, error: true });
  }
}