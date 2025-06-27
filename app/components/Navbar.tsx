"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User } from "firebase/auth";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  user: User | null;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  // Theme toggle logic
  useEffect(() => {
    if (
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      document.documentElement.classList.toggle("dark", newTheme);
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

  const toggleMobileMenu = () => setMobileMenuOpen((v) => !v);

  const handleLogout = () => {
    const auth = getAuth();
    auth.signOut().then(() => {
      router.push("/home");
    });
  };

  return (
    <>
      <nav
        className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-6xl backdrop-blur-lg border-2 rounded-full px-4 py-2 flex justify-between items-center bg-background-secondary shadow-lg"
        style={{
          borderColor: "var(--current-border-color)",
          boxShadow: "0 4px 6px var(--current-shadow-color)",
          minHeight: 56,
          marginTop: 12,
        }}
      >
        {/* Logo and Brand */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo1.jpeg"
            width={40}
            height={40}
            className="rounded-full"
            alt="Krishak Logo"
            priority
          />
          <span className="font-bold text-xl text-text-primary">Krishak</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 items-center text-text-primary">
          <Link
            href="/"
            className="hover:text-brand-accent transition-colors text-lg"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-brand-accent transition-colors text-lg"
          >
            Dashboard
          </Link>
          <Link
            href="/recomendation"
            className="hover:text-brand-accent transition-colors text-lg"
          >
            Recommendations
          </Link>
          {user ? (
            <button
              onClick={handleLogout}
              className="hover:opacity-80 transition-colors text-red-400 text-lg"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/signin"
              className="font-bold bg-brand-accent rounded-full px-6 py-3 text-brand-primary text-base w-fit flex items-center gap-2"
            >
              Login
            </Link>
          )}
          {/* Theme Toggle Button */}
          <button
            onClick={toggleDarkMode}
            aria-label={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            className="ml-2 p-2 rounded-full border border-border bg-background-primary hover:bg-background-secondary transition-colors"
            style={{ fontSize: 20 }}
          >
            {isDarkMode ? (
              // Moon icon
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  d="M21 12.79A9 9 0 0112.21 3a7 7 0 100 14 9 9 0 008.79-4.21z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              // Sun icon
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" fill="currentColor" />
                <g stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </g>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile: Avatar/Theme/Menu */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Theme Toggle Button (mobile) */}
          <button
            onClick={toggleDarkMode}
            aria-label={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            className="p-2 rounded-full border border-border bg-background-primary hover:bg-background-secondary transition-colors"
            style={{ fontSize: 20 }}
          >
            {isDarkMode ? (
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  d="M21 12.79A9 9 0 0112.21 3a7 7 0 100 14 9 9 0 008.79-4.21z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" fill="currentColor" />
                <g stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </g>
              </svg>
            )}
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMobileMenu}
            className="px-3 py-2 rounded-full bg-brand-primary text-background-primary"
            aria-label="Menu"
          >
            <FiMenu size={24} />
          </motion.button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-40 pt-20 pb-6 px-6 md:hidden bg-background-secondary"
          >
            <div className="flex justify-end mb-4">
              <button onClick={toggleMobileMenu} className="text-text-primary">
                <FiX size={24} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="py-3 px-4 rounded-lg hover:bg-brand-accent/10 transition-colors text-text-primary"
                onClick={toggleMobileMenu}
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="py-3 px-4 rounded-lg hover:bg-brand-accent/10 transition-colors text-text-primary"
                onClick={toggleMobileMenu}
              >
                Dashboard
              </Link>
              <Link
                href="/recomendation"
                className="py-3 px-4 rounded-lg hover:bg-brand-accent/10 transition-colors text-text-primary"
                onClick={toggleMobileMenu}
              >
                Recommendations
              </Link>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="py-3 px-4 rounded-lg text-left flex items-center gap-2 mt-4 text-red-400 bg-red-100/20"
                >
                  <FiLogOut size={18} /> <span>Logout</span>
                </button>
              ) : (
                <Link
                  href="/signin"
                  className="py-3 px-4 rounded-lg text-left flex items-center gap-2 mt-4 text-text-primary hover:bg-brand-accent/10"
                  onClick={toggleMobileMenu}
                >
                  <span>Login</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
