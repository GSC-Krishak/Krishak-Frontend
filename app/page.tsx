"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "./utils/firebase";

const HomePage = () => {
  const router = useRouter();
  const auth = getAuth(app);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard");
      } else {
        // Redirect to home instead of signin
        router.push("/home");
      }
    });
    return () => unsubscribe();
  }, [auth, router]);
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#12372A] text-[#FBFADA]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#436850] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-lg mt-4">Loading Krishak...</p>
      </div>
    </div>
  );
};

export default HomePage;
