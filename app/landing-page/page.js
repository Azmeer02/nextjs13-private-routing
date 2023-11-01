"use client";

import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React from "react";

const Page = () => {
  const router = useRouter();
  const Signout = () => {
    signOut(auth)
      .then((res) => {
        router.push("/");
        Cookies.remove("userID");
      })
      .catch((error) => {
        console.log(error, "USER LOGOUT");
      });
  };
  return (
    <div>
      <h1>User Landing Page</h1>
      <button onClick={Signout}>Sign Out</button>
    </div>
  );
};

export default Page;
