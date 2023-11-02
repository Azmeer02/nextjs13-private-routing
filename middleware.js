"use client";

import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore"; // Assuming you are using Firebase
import { db } from "./firebase";

const protectedRoutes = {
  "/events": "AMBASSADOR",
  "/landing-page": "USER",
};

const roleBasedLandingPages = {
  AMBASSADOR: "/events",
  USER: "/landing-page",
};

const redirectToLogin = (url) =>
  NextResponse.redirect(new URL("/", url.origin).toString());
const redirectToRoleBasedPage = (role, url) =>
  NextResponse.redirect(
    new URL(roleBasedLandingPages[role] || "/", url.origin).toString()
  );

export async function middleware(req) {
  const { cookies, nextUrl } = req;
  const userCookie = cookies.get("userID");

  if (!userCookie) {
    if (protectedRoutes[nextUrl.pathname]) {
      return redirectToLogin(nextUrl);
    }
    return;
  }

  try {
    const userRef = doc(db, "Emails_WebApp", userCookie.value);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.log("User is logged out");
      return;
    }

    const userData = userSnap.data();
    const userRole = userData?.role;

    if (nextUrl.pathname === "/") {
      return redirectToRoleBasedPage(userRole, nextUrl);
    }

    const requiredRole = protectedRoutes[nextUrl.pathname];
    if (requiredRole && userRole !== requiredRole) {
      return redirectToRoleBasedPage(userRole, nextUrl);
    }
  } catch (error) {
    console.error("Error in middleware:", error);
  }
}
