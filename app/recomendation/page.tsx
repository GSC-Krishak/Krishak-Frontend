"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSend,
  FiAlertCircle,
  FiLayout,
  FiClock,
  FiUpload,
  FiFile,
} from "react-icons/fi";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../utils/firebase";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { theme } from "../utils/theme";
import Navbar from "../components/Navbar";

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
  soil_type: string; // New field for soil type
  moisture: number; // New field for moisture content
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

// Common soil types in India
const SOIL_TYPES = [
  "Alluvial Soil",
  "Black/Regur Soil",
  "Red Soil",
  "Laterite Soil",
  "Desert/Arid Soil",
  "Mountain Soil",
  "Loamy Soil",
  "Sandy Soil",
  "Clay Soil",
  "Silty Soil",
  "Peaty Soil",
  "Chalky Soil",
];

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
    soil_type: "", // Initialize soil type field
    moisture: 0, // Initialize moisture field
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
  const [file, setFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
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
      [name]: ["ph", "n", "p", "k", "mg", "calcium", "moisture"].includes(name)
        ? Math.max(
            0,
            name === "ph" ? Math.min(parseFloat(value), 14) : parseFloat(value)
          )
        : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileUpload = async () => {
    if (!file || !user?.uid) return;

    setFileUploading(true);
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user.uid);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/uploadSoilData`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to upload soil data");

      const data = await response.json();

      // Update soil data state with the parsed data from the file
      setSoilData({
        ...soilData,
        ...data.soilData,
      });

      // Show success message
      alert("Soil data uploaded and parsed successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "File upload failed");
    } finally {
      setFileUploading(false);
    }
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

    // Check if soil type is selected
    if (!soilData.soil_type) {
      setError("Please select a soil type");
      return;
    }

    // Check if moisture is provided
    if (soilData.moisture <= 0) {
      setError("Please enter a valid moisture level greater than 0");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...soilData,
        district: soilData.district.toLowerCase().trim(),
        state: soilData.state.toLowerCase().trim(),
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
      soil_type: "", // Reset soil type
      moisture: 0, // Reset moisture
    });
  };

  const getCompatibilityColor = (compatibility: string) => {
    switch (compatibility.toLowerCase()) {
      case "best":
        return "#10b981"; // Green color
      case "good":
        return "#f59e0b"; // Yellow/amber color
      case "not recommended":
        return "#ef4444"; // Red color
      default:
        return theme.accent;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden min-w-screen"
      style={{ backgroundColor: theme.primary, color: theme.light }}
    >
      {/* Replace the old navbar with the new component */}
      <Navbar user={user} />

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

                {/* File Upload Section */}
                <div
                  className="mb-8 border-2 border-dashed rounded-lg p-4 text-center"
                  style={{
                    borderColor: dragActive ? theme.light : `${theme.light}50`,
                    backgroundColor: dragActive
                      ? `${theme.secondary}40`
                      : `${theme.secondary}20`,
                    transition: "all 0.2s ease",
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleFileDrop}
                >
                  <div className="space-y-4 py-4">
                    <FiUpload
                      className="mx-auto"
                      size={36}
                      style={{ color: theme.light }}
                    />
                    <h3
                      className="text-lg font-medium"
                      style={{ color: theme.light }}
                    >
                      Upload Soil Data File
                    </h3>
                    <p style={{ color: `${theme.light}CC` }}>
                      Drag & drop your CSV or Excel file here, or click to
                      browse
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={handleFileChange}
                    />
                    <div className="flex flex-col sm:flex-row justify-center gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                        style={{
                          backgroundColor: theme.accent,
                          color: theme.light,
                        }}
                      >
                        <FiFile size={16} />
                        <span>Browse Files</span>
                      </button>

                      {file && (
                        <button
                          type="button"
                          onClick={handleFileUpload}
                          disabled={fileUploading}
                          className="px-4 py-2 rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                          style={{
                            backgroundColor: theme.secondary,
                            color: theme.light,
                          }}
                        >
                          {fileUploading ? (
                            <div
                              className="animate-spin h-4 w-4 border-2 rounded-full"
                              style={{
                                borderColor: theme.light,
                                borderTopColor: "transparent",
                              }}
                            ></div>
                          ) : (
                            <FiUpload size={16} />
                          )}
                          <span>
                            {fileUploading ? "Uploading..." : "Upload"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {file && (
                    <div
                      className="mt-3 p-3 rounded-lg flex items-center justify-between"
                      style={{ backgroundColor: `${theme.primary}80` }}
                    >
                      <div className="flex items-center gap-2">
                        <FiFile style={{ color: theme.light }} />
                        <span style={{ color: theme.light }}>{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-red-400 hover:text-red-300"
                      >
                        &times;
                      </button>
                    </div>
                  )}

                  <p
                    className="text-xs mt-3"
                    style={{ color: `${theme.light}99` }}
                  >
                    Supported formats: PDF
                  </p>
                </div>

                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-full">
                    <hr
                      className="w-full border-t"
                      style={{ borderColor: `${theme.light}30` }}
                    />
                    <span
                      className="absolute px-3 text-sm -translate-y-1/2 rounded-full"
                      style={{
                        backgroundColor: theme.secondary,
                        color: theme.light,
                      }}
                    >
                      OR
                    </span>
                  </div>
                </div>

                {/* Form with proper closure */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Soil Type Dropdown - New Field */}
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: `${theme.light}CC` }}
                      >
                        Soil Type
                      </label>
                      <select
                        name="soil_type"
                        value={soilData.soil_type}
                        onChange={handleInputChange}
                        className="w-full backdrop-blur-lg border rounded-xl px-4 py-3 focus:outline-none transition-all"
                        style={{
                          backgroundColor: `${theme.secondary}30`,
                          borderColor: `${theme.light}30`,
                          color: theme.light,
                        }}
                        required
                      >
                        <option value="" disabled>
                          Select soil type
                        </option>
                        {SOIL_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Moisture Level - New Field */}
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: `${theme.light}CC` }}
                      >
                        Moisture Level (%)
                      </label>
                      <input
                        type="number"
                        name="moisture"
                        value={soilData.moisture}
                        onChange={handleInputChange}
                        min="0.1"
                        step="0.1"
                        className="w-full backdrop-blur-lg border rounded-xl px-4 py-3 focus:outline-none transition-all"
                        style={{
                          backgroundColor: `${theme.secondary}30`,
                          borderColor: `${theme.light}30`,
                          color: theme.light,
                        }}
                        required
                      />
                    </div>

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

                {/* Show soil information in results view */}
                <div
                  className="backdrop-blur-lg border rounded-2xl p-6"
                  style={{
                    backgroundColor: `${theme.secondary}20`,
                    borderColor: `${theme.light}30`,
                  }}
                >
                  <h3
                    className="text-xl font-bold mb-4"
                    style={{ color: theme.light }}
                  >
                    Soil Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p
                        className="text-sm"
                        style={{ color: `${theme.light}80` }}
                      >
                        Soil Type
                      </p>
                      <p className="font-medium" style={{ color: theme.light }}>
                        {soilData.soil_type}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-sm"
                        style={{ color: `${theme.light}80` }}
                      >
                        Moisture
                      </p>
                      <p className="font-medium" style={{ color: theme.light }}>
                        {soilData.moisture}%
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-sm"
                        style={{ color: `${theme.light}80` }}
                      >
                        pH Level
                      </p>
                      <p className="font-medium" style={{ color: theme.light }}>
                        {soilData.ph}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-sm"
                        style={{ color: `${theme.light}80` }}
                      >
                        Location
                      </p>
                      <p className="font-medium" style={{ color: theme.light }}>
                        {soilData.district}, {soilData.state}
                      </p>
                    </div>
                  </div>
                </div>

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
                            className="text-xs px-3 min-w-fit py-1 rounded-full text-center font-medium"
                            style={{
                              backgroundColor: `${getCompatibilityColor(
                                crop.Compatibility
                              )}30`,
                              color: getCompatibilityColor(crop.Compatibility),
                              borderColor: getCompatibilityColor(
                                crop.Compatibility
                              ),
                              borderWidth: "1px",
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

                <div className="flex flex-wrap justify-center mt-8 gap-4">
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
                  <Link
                    href="/dashboard"
                    className="px-6 py-3 rounded-xl hover:opacity-90 transition-colors flex items-center space-x-2"
                    style={{
                      backgroundColor: theme.secondary,
                      color: theme.light,
                    }}
                  >
                    <FiLayout className="w-5 h-5" />
                    <span>Go to Dashboard</span>
                  </Link>
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
