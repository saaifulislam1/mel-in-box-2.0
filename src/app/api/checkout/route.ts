// src/app/api/checkout/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(request: Request) {
  if (!stripeSecret) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2024-06-20",
  });

  try {
    const body = await request.json();
    const {
      bookingId,
      packageId,
      packageName,
      packagePrice,
      partyDate,
      partyTime,
      location,
      contactEmail,
      email: ownerEmail,
    } = body;

    if (!bookingId || !packageId || !packageName || !packagePrice) {
      return NextResponse.json(
        { error: "Booking or package information missing" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: packageName,
              description: `Party on ${partyDate || "date tbd"} at ${
                location || "location tbd"
              }`,
            },
            unit_amount: Math.round(Number(packagePrice) * 100),
          },
        },
      ],
      success_url: `${baseUrl}/parties/success?bookingId=${bookingId}`,
      cancel_url: `${baseUrl}/parties/${packageId}/book?canceled=1&bookingId=${bookingId}`,
      metadata: {
        bookingId,
        packageId,
      },
      customer_email: contactEmail || ownerEmail,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Checkout error", err);
    return NextResponse.json(
      { error: err.message || "Checkout failed" },
      { status: 500 }
    );
  }
}
