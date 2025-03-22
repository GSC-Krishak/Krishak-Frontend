"use client";
import React from "react";
import { motion } from "framer-motion";
import { FaGoogle } from "react-icons/fa";
import Head from "next/head";
import Image from "next/image";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app } from "../utils/firebase"; // Adjust the import path as necessary

const auth = getAuth(app);

const handleGoogleSignIn = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider);
};

const LoginPage: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <Head>
        <title>Login | Namek Krishak</title>
        <meta
          name="description"
          content="Login to Namek Krishak agriculture crop recommendation system"
        />
      </Head>

      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block mb-4"
            >
              <Image
                src="/logo1.jpeg"
                alt="Namek Krishak Logo"
                width={80}
                height={80}
                className="mx-auto rounded-full"
              />
            </motion.div>
            <h1 className="text-3xl font-bold text-green-500 mb-2">
              Namek Krishak
            </h1>
            <p className="text-gray-400">
              Your personal crop recommendation assistant
            </p>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-400">
                  Continue with
                </span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-medium transition-all duration-200 relative overflow-hidden mt-4 flex items-center justify-center gap-2"
            >
              <FaGoogle />
              Sign in with Google
            </motion.button>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-center text-sm text-gray-400"
          >
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-medium text-green-500 hover:text-green-400 transition-colors"
            >
              Sign up
            </a>
          </motion.p>
        </motion.div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 to-black/90 z-10"></div>
          <Image
            src="/img1.jpg"
            alt="Agriculture Field"
            layout="fill"
            objectFit="cover"
            className="z-0"
          />

          <div className="absolute inset-0 z-20 flex flex-col justify-center items-center p-12 text-center">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-4xl font-bold mb-4"
            >
              Grow Smarter With Data
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="text-lg text-gray-200 max-w-md"
            >
              Get personalized crop recommendations based on soil conditions,
              climate data, and market trends.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.9 }}
              className="mt-8 grid grid-cols-3 gap-4"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                    <span className="text-green-400 text-xl">✓</span>
                  </div>
                  <span className="text-sm text-gray-300">
                    {i === 1
                      ? "Data-driven"
                      : i === 2
                      ? "Sustainable"
                      : "Profitable"}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
