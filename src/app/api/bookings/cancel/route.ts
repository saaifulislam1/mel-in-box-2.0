// src/app/api/bookings/cancel/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;

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
    const { bookingId, stripeSessionId, paymentIntentId } =
      await request.json();
    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 }
      );
    }

    if (!stripeSessionId && !paymentIntentId) {
      return NextResponse.json({
        status: "canceled",
        message: "Booking canceled (no Stripe session or payment intent).",
      });
    }

    let intentId = paymentIntentId;
    if (!intentId && stripeSessionId) {
      const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
      if (!session.payment_intent) {
        return NextResponse.json({
          status: "canceled",
          message: "Booking canceled (no payment intent found).",
        });
      }
      intentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent.id;
    }
    if (!intentId) {
      return NextResponse.json({
        status: "canceled",
        message: "Booking canceled (missing payment intent).",
      });
    }

    const refund = await stripe.refunds.create({
      payment_intent: intentId,
      reason: "requested_by_customer",
    });

    return NextResponse.json({
      status: "canceled",
      refundId: refund.id,
      refundStatus: refund.status,
      refundAmount: (refund.amount ?? 0) / 100,
      paymentIntentId: intentId,
    });
  } catch (err) {
    console.error("Cancel booking error", err);
    return NextResponse.json(
      {
        error: "Unable to cancel booking. Please try again or refund manually.",
      },
      { status: 500 }
    );
  }
}
