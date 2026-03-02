import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { verifyUnsubscribeToken } from "@/lib/newsletter";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!token) {
    return NextResponse.redirect(`${appUrl}/?newsletter=missing-token`);
  }

  const verified = verifyUnsubscribeToken(token);
  if (!verified) {
    return NextResponse.redirect(`${appUrl}/?newsletter=invalid-token`);
  }

  await dbConnect();

  await User.findOneAndUpdate(
    { _id: verified.userId, email: verified.email },
    {
      newsletterSubscribed: false,
      newsletterUnsubscribedAt: new Date(),
    }
  );

  return NextResponse.redirect(`${appUrl}/?newsletter=unsubscribed`);
}
