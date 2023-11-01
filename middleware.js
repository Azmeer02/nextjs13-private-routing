"use client";

import { NextResponse } from "next/server";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

const protectedRoutes = {
  "/events": "AMBASSADOR",
  "/landing-page": "USER",
};

const roleBasedLandingPages = {
  AMBASSADOR: "/events",
  USER: "/landing-page",
};

export async function middleware(req) {
  const userCookie = req.cookies.get("userID");

  if (protectedRoutes[req.nextUrl.pathname] && !userCookie) {
    const loginURL = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(loginURL.toString());
  }

  if (userCookie) {
    try {
      const userRef = doc(db, "Emails_WebApp", userCookie?.value);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const userRole = userData?.role;

        if (req.nextUrl.pathname === "/") {
          const redirectURL = new URL(
            roleBasedLandingPages[userRole] || "/",
            req.nextUrl.origin
          );
          return NextResponse.redirect(redirectURL.toString());
        }

        if (protectedRoutes[req.nextUrl.pathname]) {
          // If cookie does not exist or does not match the required role for that route
          if (userRole !== protectedRoutes[req.nextUrl.pathname]) {
            const redirectURL = new URL(
              roleBasedLandingPages[userRole] || "/",
              req.nextUrl.origin
            );
            return NextResponse.redirect(redirectURL.toString());
          }
        }
      } else {
        console.log("user is logged out");
      }
    } catch (error) {
      console.log("🚀 ~ error:", error);
    }
  }
}
