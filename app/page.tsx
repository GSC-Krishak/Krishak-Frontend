"use client";
import React, { useState, useEffect } from "react";
import { SigninButton } from "@/app/components/signinButton";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "./utils/firebase";
import { useRouter } from "next/navigation";

export default function Home() {
  return <Page />;
}

function Page() {
  const auth = getAuth(app);
  const [user, setUser] = useState({ Loading: true, user: null });

  useEffect(() => {
    onAuthStateChanged(auth, function (user) {
      if (user && user.email) {
        setUser({
          Loading: false,
          user: {
            email: user.email,
          },
        });
        console.log("This is the user: ", user);
      } else {
        setUser({
          Loading: false,
          user: null,
        });
        console.log("There is no logged in user");
      }
    });
  }, [auth]);

  if (user.Loading) {
    return <div>Loading</div>;
  }

  if (!user.user) {
    return (
      <div className="">
        <SigninButton />
      </div>
    );
  }

  return <div>Welcome {user.user.email}</div>;
}
