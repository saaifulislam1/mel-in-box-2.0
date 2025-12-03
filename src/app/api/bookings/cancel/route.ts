// src/app/api/bookings/cancel/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getPartyBooking, updatePartyBooking } from "@/lib/partyService";

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
    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 }
      );
    }

    const booking = await getPartyBooking(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!booking.stripeSessionId) {
      await updatePartyBooking(bookingId, { status: "canceled" });
      return NextResponse.json({
        status: "canceled",
        message: "Booking canceled (no Stripe session found)",
      });
    }

    const session = await stripe.checkout.sessions.retrieve(
      booking.stripeSessionId
    );

    if (!session.payment_intent) {
      await updatePartyBooking(bookingId, { status: "canceled" });
      return NextResponse.json({
        status: "canceled",
        message: "Booking canceled (no payment intent found)",
      });
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent.id;

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: "requested_by_customer",
    });

    await updatePartyBooking(bookingId, {
      status: "canceled",
      refundId: refund.id,
      refundAmount: (refund.amount ?? 0) / 100,
      refundStatus: refund.status,
      refundedAt: new Date().toISOString(),
      paymentIntentId,
    });

    return NextResponse.json({
      status: "canceled",
      refundId: refund.id,
      refundStatus: refund.status,
      refundAmount: (refund.amount ?? 0) / 100,
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
