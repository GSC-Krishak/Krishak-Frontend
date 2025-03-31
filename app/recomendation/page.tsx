"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiAlertCircle, FiLayout, FiClock } from "react-icons/fi";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../utils/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User } from "firebase/auth";
import { theme } from "../utils/theme";

// Type definitions (keep existing interfaces)
interface SoilData {
  n: number;
  p: number;
  k: number;
  mg: number;
  calcium: number;
  ph: number;
  previous_crops: string[];
  district: string;
  state: string;
}

interface FertilizerAdjustment {
  [key: string]: string;
}

interface RecommendedCrop {
  Commodity: string;
  Profitability: number;
  Fertilizer_Cost: number;
  Fertilizer_Adjustments: FertilizerAdjustment;
  Compatibility: string;
}

const SoilRecommendationPage: React.FC = () => {
  const [soilData, setSoilData] = useState<SoilData>({
    n: 0,
    p: 0,
    k: 0,
    mg: 0,
    calcium: 0,
    ph: 0,
    previous_crops: [],
    district: "",
    state: "",
  });
  const [recommendedCrops, setRecommendedCrops] = useState<RecommendedCrop[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [dailyRequestsCount, setDailyRequestsCount] = useState<number>(0);
  const [isLimitReached, setIsLimitReached] = useState<boolean>(false);
  const DAILY_LIMIT = 5;
  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push("/signin");
      } else {
        // Check daily request limit when user logs in
        checkDailyLimit(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  // Function to check daily limit
  const checkDailyLimit = (userId: string) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const storedLimitData = localStorage.getItem(`requestLimit_${userId}`);

    if (storedLimitData) {
      const limitData = JSON.parse(storedLimitData);
      if (limitData.date === today) {
        setDailyRequestsCount(limitData.count);
        setIsLimitReached(limitData.count >= DAILY_LIMIT);
      } else {
        // Reset counter for new day
        setDailyRequestsCount(0);
        setIsLimitReached(false);
        localStorage.setItem(
          `requestLimit_${userId}`,
          JSON.stringify({
            date: today,
            count: 0,
          })
        );
      }
    } else {
      // First time user is making requests today
      setDailyRequestsCount(0);
      setIsLimitReached(false);
      localStorage.setItem(
        `requestLimit_${userId}`,
        JSON.stringify({
          date: today,
          count: 0,
        })
      );
    }
  };

  // Update localStorage and state when a new recommendation is made
  const incrementRequestCount = (userId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const newCount = dailyRequestsCount + 1;
    setDailyRequestsCount(newCount);

    localStorage.setItem(
      `requestLimit_${userId}`,
      JSON.stringify({
        date: today,
        count: newCount,
      })
    );

    if (newCount >= DAILY_LIMIT) {
      setIsLimitReached(true);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "previous_crops") {
      setSoilData((prev) => ({
        ...prev,
        previous_crops: value.split(",").map((crop) => crop.trim()),
      }));
      return;
    }

    setSoilData((prev) => ({
      ...prev,
      [name]: ["ph", "n", "p", "k", "mg", "calcium"].includes(name)
        ? Math.max(
            0,
            name === "ph" ? Math.min(parseFloat(value), 14) : parseFloat(value)
          )
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid) {
      setError("User authentication required");
      return;
    }

    // Check if daily limit reached
    if (isLimitReached) {
      setError(
        "You have reached the daily limit of 5 recommendations. Please try again tomorrow."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...soilData,
        userId: user.uid,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();
      setRecommendedCrops(data.Recommended_Crops);
      setFormSubmitted(true);

      // Increment the request count after successful submission
      incrementRequestCount(user.uid);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      router.push("/signin");
    });
  };

  const handleNewRecommendation = () => {
    setFormSubmitted(false);
    setRecommendedCrops([]);
    setSoilData({
      n: 0,
      p: 0,
      k: 0,
      mg: 0,
      calcium: 0,
      ph: 0,
      previous_crops: [],
      district: "",
      state: "",
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden min-w-screen"
      style={{ backgroundColor: theme.primary, color: theme.light }}
    >
      {/* Updated Navbar */}
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

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-4 py-2 rounded-full font-medium"
              style={{ backgroundColor: theme.light, color: theme.primary }}
            >
              Logout
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center pt-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl mx-auto mt-7">
          {/* Daily limit indicator */}
          <div className="mb-4 flex justify-end">
            <div
              className="backdrop-blur-lg rounded-lg px-4 py-2 flex items-center"
              style={{
                backgroundColor: isLimitReached
                  ? `rgba(239, 68, 68, 0.2)`
                  : `${theme.secondary}20`,
                borderColor: isLimitReached
                  ? "rgba(239, 68, 68, 0.3)"
                  : `${theme.light}20`,
                borderWidth: "1px",
              }}
            >
              <FiClock
                className="mr-2"
                style={{ color: isLimitReached ? "#ef4444" : theme.light }}
              />
              <span style={{ color: theme.light }}>
                Daily Recommendations: <strong>{dailyRequestsCount}</strong>/
                {DAILY_LIMIT}
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!formSubmitted ? (
              <motion.div
                key="soil-form"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
                className="backdrop-blur-lg rounded-2xl border shadow-2xl p-8"
                style={{
                  backgroundColor: `${theme.secondary}20`,
                  borderColor: `${theme.light}20`,
                }}
              >
                <h2
                  className="text-3xl font-bold mb-6 text-center"
                  style={{ color: theme.light }}
                >
                  Soil Data Analysis
                </h2>

                {/* Show warning when limit is reached */}
                {isLimitReached && (
                  <div
                    className="mb-6 p-4 rounded-lg flex items-center"
                    style={{
                      backgroundColor: "rgba(239, 68, 68, 0.2)",
                      borderLeft: "4px solid #ef4444",
                    }}
                  >
                    <FiAlertCircle
                      className="mr-3 flex-shrink-0"
                      size={20}
                      style={{ color: "#ef4444" }}
                    />
                    <p style={{ color: theme.light }}>
                      You've reached the daily limit of {DAILY_LIMIT}{" "}
                      recommendations. Please try again tomorrow.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {["n", "p", "k", "mg", "calcium"].map((field) => (
                      <div key={field}>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: `${theme.light}CC` }}
                        >
                          {field.toUpperCase()} Level
                        </label>
                        <input
                          type="number"
                          name={field}
                          value={soilData[field as keyof SoilData]}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full backdrop-blur-lg border rounded-xl px-4 py-3 focus:outline-none transition-all"
                          style={{
                            backgroundColor: `${theme.secondary}30`,
                            borderColor: `${theme.light}30`,
                            color: theme.light,
                          }}
                          required
                        />
                      </div>
                    ))}

                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: `${theme.light}CC` }}
                      >
                        pH Level
                      </label>
                      <input
                        type="number"
                        name="ph"
                        step="0.1"
                        min="0"
                        max="14"
                        value={soilData.ph}
                        onChange={handleInputChange}
                        className="w-full backdrop-blur-lg border rounded-xl px-4 py-3 focus:outline-none transition-all"
                        style={{
                          backgroundColor: `${theme.secondary}30`,
                          borderColor: `${theme.light}30`,
                          color: theme.light,
                        }}
                        required
                      />
                    </div>

                    <div className="col-span-full">
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: `${theme.light}CC` }}
                      >
                        Previous Crops (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="previous_crops"
                        value={soilData.previous_crops.join(", ")}
                        onChange={handleInputChange}
                        className="w-full backdrop-blur-lg border rounded-xl px-4 py-3 focus:outline-none transition-all"
                        style={{
                          backgroundColor: `${theme.secondary}30`,
                          borderColor: `${theme.light}30`,
                          color: theme.light,
                        }}
                        placeholder="e.g., Wheat, Soybean"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: `${theme.light}CC` }}
                      >
                        District
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={soilData.district}
                        onChange={handleInputChange}
                        className="w-full backdrop-blur-lg border rounded-xl px-4 py-3 focus:outline-none transition-all"
                        style={{
                          backgroundColor: `${theme.secondary}30`,
                          borderColor: `${theme.light}30`,
                          color: theme.light,
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: `${theme.light}CC` }}
                      >
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={soilData.state}
                        onChange={handleInputChange}
                        className="w-full backdrop-blur-lg border rounded-xl px-4 py-3 focus:outline-none transition-all"
                        style={{
                          backgroundColor: `${theme.secondary}30`,
                          borderColor: `${theme.light}30`,
                          color: theme.light,
                        }}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || isLimitReached}
                    className="w-full py-4 rounded-xl hover:opacity-90 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                    style={{
                      backgroundColor: isLimitReached
                        ? "#6b7280"
                        : theme.secondary,
                      color: theme.light,
                    }}
                  >
                    {loading ? (
                      <div
                        className="animate-spin h-6 w-6 border-3 rounded-full"
                        style={{
                          borderColor: theme.light,
                          borderTopColor: "transparent",
                        }}
                      ></div>
                    ) : (
                      <>
                        <FiSend className="w-5 h-5" />
                        <span>Get Recommendations</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Daily limit indicator in results view */}
                {dailyRequestsCount >= DAILY_LIMIT && (
                  <div
                    className="backdrop-blur-lg border rounded-2xl p-6 flex items-center"
                    style={{
                      backgroundColor: `rgba(239, 68, 68, 0.15)`,
                      borderColor: `rgba(239, 68, 68, 0.3)`,
                    }}
                  >
                    <FiAlertCircle
                      className="mr-4 w-6 h-6"
                      style={{ color: "#ef4444" }}
                    />
                    <p style={{ color: theme.light }}>
                      You've used all {DAILY_LIMIT} recommendations for today.
                      Come back tomorrow for more!
                    </p>
                  </div>
                )}

                {error && (
                  <div
                    className="backdrop-blur-lg border rounded-2xl p-6 flex items-center"
                    style={{
                      backgroundColor: `${theme.accent}30`,
                      borderColor: `${theme.light}30`,
                    }}
                  >
                    <FiAlertCircle
                      className="mr-4 w-6 h-6"
                      style={{ color: theme.light }}
                    />
                    <p style={{ color: theme.light }}>{error}</p>
                  </div>
                )}

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedCrops.map((crop, index) => (
                    <motion.div
                      key={crop.Commodity}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.1,
                      }}
                      className="backdrop-blur-lg border rounded-2xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl min-w-fit"
                      style={{
                        backgroundColor: `${theme.secondary}30`,
                        borderColor: `${theme.light}20`,
                        borderWidth: "1px",
                      }}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3
                            className="text-2xl font-bold"
                            style={{ color: theme.light }}
                          >
                            {crop.Commodity}
                          </h3>
                          <span
                            className="text-xs px-3 min-w-fit py-1 rounded-full text-center"
                            style={{
                              backgroundColor: `${theme.accent}50`,
                              color: theme.light,
                            }}
                          >
                            {crop.Compatibility}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <p
                              className="text-sm"
                              style={{ color: `${theme.light}80` }}
                            >
                              Profitability
                            </p>
                            <p
                              className="font-semibold"
                              style={{ color: theme.light }}
                            >
                              ₹{crop.Profitability}
                            </p>
                          </div>
                          <div>
                            <p
                              className="text-sm"
                              style={{ color: `${theme.light}80` }}
                            >
                              Fertilizer Cost
                            </p>
                            <p
                              className="font-semibold"
                              style={{ color: theme.light }}
                            >
                              ₹{crop.Fertilizer_Cost}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p
                            className="mb-2 text-sm"
                            style={{ color: `${theme.light}80` }}
                          >
                            Fertilizer Adjustments
                          </p>
                          <div
                            className="rounded-xl p-3"
                            style={{ backgroundColor: `${theme.primary}60` }}
                          >
                            {Object.entries(crop.Fertilizer_Adjustments).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="flex justify-between text-sm py-1"
                                >
                                  <span style={{ color: `${theme.light}CC` }}>
                                    {key}{" "}
                                  </span>
                                  <span
                                    className="text-xs"
                                    style={{ color: theme.light }}
                                  >
                                    {value}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleNewRecommendation}
                    className="px-6 py-3 rounded-xl hover:opacity-90 transition-colors flex items-center space-x-2"
                    style={{
                      backgroundColor: theme.secondary,
                      color: theme.light,
                    }}
                  >
                    <FiSend className="w-5 h-5" />
                    <span>New Recommendation</span>
                  </button>
                  <button
                    className="px-6 py-3 rounded-xl hover:opacity-90 transition-colors flex items-center space-x-2 mx-4"
                    style={{
                      backgroundColor: theme.secondary,
                      color: theme.light,
                    }}
                  >
                    <FiLayout className="w-5 h-5" />
                    <a href="/dashboard">Go to Dashboard</a>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SoilRecommendationPage;
