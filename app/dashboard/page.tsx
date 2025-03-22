"use client";
import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { app } from "../utils/firebase";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { useRouter } from "next/navigation";

const auth = getAuth(app);
const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div>
      <nav>
        {user ? (
          <div className="flex items-center gap-4">
            <span>Welcome, {user.displayName}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          // redirect it to the login page
          <button onClick={handleGoogleSignIn}>Login with Google</button>
        )}
      </nav>
      <main>
        <div
          style={{
            border: "2px dashed black",
            padding: "20px",
            marginTop: "20px",
          }}
        >
          <button
            className="px-6 py-2 bg-green-500 "
            onClick={() => alert("Add Soil Report")}
          >
            Add Soil Report
          </button>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
