"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User } from "firebase/auth";
import { theme } from "../utils/theme";

interface NavbarProps {
  user: User | null;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      router.push("/signin");
    });
  };

  return (
    <>
      <nav
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-6xl backdrop-blur-lg border rounded-full px-6 py-3"
        style={{
          backgroundColor: `${theme.primary}80`,
          borderColor: `${theme.light}10`,
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/logo1.jpeg"
              width={48}
              height={48}
              className="rounded-full"
              alt="Logo"
            />
            <span className="font-bold text-xl" style={{ color: theme.light }}>
              Krishak
            </span>
          </div>

          {/* Desktop Navigation - Visible on md and larger screens */}
          <div className="hidden md:flex gap-8" style={{ color: theme.light }}>
            <Link
              href="/"
              className="hover:opacity-80 transition-colors"
              style={{ color: theme.light }}
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="hover:opacity-80 transition-colors"
              style={{ color: theme.light }}
            >
              Dashboard
            </Link>
            <Link
              href="/recomendation"
              className="hover:opacity-80 transition-colors"
              style={{ color: theme.light }}
            >
              Recommendations
            </Link>
            {/* Logout button in desktop view */}
            <button
              onClick={handleLogout}
              className="hover:opacity-80 transition-colors text-red-400"
            >
              Logout
            </button>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{
                    backgroundColor: theme.secondary,
                    color: theme.light,
                  }}
                >
                  {user.displayName?.charAt(0).toUpperCase() || "U"}
                </div>
                <span
                  className="hidden md:block text-sm font-medium"
                  style={{ color: theme.light }}
                >
                  {user.displayName}
                </span>
              </div>
            )}

            {/* Hamburger Menu Button - Only visible on mobile */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMobileMenu}
              className="md:hidden px-3 py-2 rounded-full"
              style={{
                backgroundColor: theme.secondary,
                color: theme.light,
              }}
              aria-label="Menu"
            >
              <FiMenu size={24} />
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu - Only for small screens */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-40 pt-20 pb-6 px-6 md:hidden"
            style={{ backgroundColor: theme.primary }}
          >
            <div className="flex justify-end mb-4">
              <button onClick={toggleMobileMenu} style={{ color: theme.light }}>
                <FiX size={24} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="py-3 px-4 rounded-lg hover:bg-opacity-20 transition-colors"
                style={{
                  color: theme.light,
                  backgroundColor: `${theme.secondary}20`,
                }}
                onClick={toggleMobileMenu}
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="py-3 px-4 rounded-lg hover:bg-opacity-20 transition-colors"
                style={{
                  color: theme.light,
                  backgroundColor: `${theme.secondary}20`,
                }}
                onClick={toggleMobileMenu}
              >
                Dashboard
              </Link>
              <Link
                href="/recomendation"
                className="py-3 px-4 rounded-lg hover:bg-opacity-20 transition-colors"
                style={{
                  color: theme.light,
                  backgroundColor: `${theme.secondary}20`,
                }}
                onClick={toggleMobileMenu}
              >
                Recommendations
              </Link>

              {/* Logout button in mobile menu */}
              <button
                onClick={handleLogout}
                className="py-3 px-4 rounded-lg text-left flex items-center gap-2 mt-4"
                style={{
                  color: "#ef4444",
                  backgroundColor: `rgba(239, 68, 68, 0.15)`,
                }}
              >
                <FiLogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
