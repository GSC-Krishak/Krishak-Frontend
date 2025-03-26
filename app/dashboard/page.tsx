"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiAlertCircle, FiLogOut } from "react-icons/fi";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../utils/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User } from "firebase/auth";

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
  // Existing state variables
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
  const router = useRouter();
  const auth = getAuth(app);

  // Existing useEffect for authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push("/signin");
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  // Existing input change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Special handling for previous_crops
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
        ? Math.max(0, parseFloat(value))
        : value,
    }));
  };

  // Existing submit handler without rate limiting
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const payload = {
  //       ...soilData,
  //       user_id: user?.uid || "unknown_user",
  //     };

  //     const response = await fetch(
  //       "https://krishak-backend-1015721062389.asia-south1.run.app/predict",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(payload),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch recommendations");
  //     }

  //     const data = await response.json();
  //     console.log(data);
  //     setRecommendedCrops(data.Recommended_Crops);
  //     setFormSubmitted(true);
  //   } catch (err) {
  //     setError(
  //       err instanceof Error ? err.message : "An unknown error occurred"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // sumit handler with late limitng
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get the current date
    const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

    // Retrieve request data from local storage
    const requestData = JSON.parse(localStorage.getItem("requestData") || "{}");

    // Check if the user has already made 5 requests today
    if (requestData.date === today && requestData.count >= 5) {
      setError("You have reached the daily limit of 5 requests.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...soilData,
        user_id: user?.uid || "unknown_user",
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
      console.log(data);
      setRecommendedCrops(data.Recommended_Crops);
      setFormSubmitted(true);

      // Update request count in local storage
      const updatedRequestData = {
        date: today,
        count: requestData.date === today ? requestData.count + 1 : 1,
      };
      localStorage.setItem("requestData", JSON.stringify(updatedRequestData));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  // Existing logout handler
  const handleLogout = () => {
    auth.signOut().then(() => {
      router.push("/signin");
    });
  };

  // Reset form to submit new recommendations
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden">
      {/* Blurred Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src="/logo1.jpeg"
              alt="Namek Krishak Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <h1 className="text-xl font-bold text-green-500">Krishak</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                {user.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user.displayName}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:bg-red-500/10 p-2 rounded-full transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center pt-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            {!formSubmitted ? (
              <motion.div
                key="soil-form"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl p-8"
              >
                <h2 className="text-3xl font-bold mb-6 text-center text-green-500">
                  Soil Data Analysis
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Numeric Inputs */}
                    {["n", "p", "k", "mg", "calcium"].map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {field.toUpperCase()} Level
                        </label>
                        <input
                          type="number"
                          name={field}
                          value={soilData[field as keyof SoilData]}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                          required
                        />
                      </div>
                    ))}

                    {/* pH Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        pH Level
                      </label>
                      <input
                        type="number"
                        name="ph"
                        step="0.1"
                        value={soilData.ph}
                        onChange={handleInputChange}
                        className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        required
                      />
                    </div>

                    {/* Previous Crops */}
                    <div className="col-span-full">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Previous Crops (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="previous_crops"
                        value={soilData.previous_crops.join(", ")}
                        onChange={handleInputChange}
                        className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="e.g., Wheat, Soybean"
                      />
                    </div>

                    {/* Location Inputs */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        District
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={soilData.district}
                        onChange={handleInputChange}
                        className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={soilData.state}
                        onChange={handleInputChange}
                        className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full"></div>
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
                {/* Error Handling */}
                {error && (
                  <div className="bg-red-900/30 backdrop-blur-lg border border-red-700 rounded-2xl p-6 flex items-center">
                    <FiAlertCircle className="text-red-500 mr-4 w-6 h-6" />
                    <p className="text-red-300">{error}</p>
                  </div>
                )}

                {/* Recommended Crops Grid */}
                <div className=" mt-1.5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedCrops.map((crop, index) => (
                    <motion.div
                      key={crop.Commodity}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.1,
                      }}
                      className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden transform transition-all hover:scale-105 hover:border-green-500"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-2xl font-bold text-green-500">
                            {crop.Commodity}
                          </h3>
                          <span className="bg-green-900/50 text-green-300 text-xs px-3 min-w-fit py-1 rounded-full text-center">
                            {crop.Compatibility}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <p className="text-gray-400 text-sm">
                              Profitability
                            </p>
                            <p className="font-semibold text-white">
                              ₹{crop.Profitability}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">
                              Fertilizer Cost
                            </p>
                            <p className="font-semibold text-white">
                              ₹{crop.Fertilizer_Cost}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-gray-400 mb-2 text-sm">
                            Fertilizer Adjustments
                          </p>
                          <div className="bg-white/5 rounded-xl p-3">
                            {Object.entries(crop.Fertilizer_Adjustments).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="flex justify-between text-sm py-1"
                                >
                                  <span className="text-gray-300">
                                    {key}{" "}
                                    <span className="font-thin text-zinc-500 text-xs">
                                      hec/Kg
                                    </span>
                                  </span>
                                  <span className="text-green-400">
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

                {/* New Recommendation Button */}
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleNewRecommendation}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <FiSend className="w-5 h-5" />
                    <span>New Recommendation</span>
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
