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
import Link from "next/link";
import StepSidebar from "./StepSidebar";
import StepPersonalDetails from "./StepPersonalDetails";
import StepSoilCropData from "./StepSoilCropData";
import StepRecommendations from "./StepRecommendations";

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

const steps = [
  "Personal Details",
  "Soil & Crop Data",
  "Recommendations",
];

const SoilRecommendationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [recommendations, setRecommendations] = useState<any[]>([]);
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [dailyRequestsCount, setDailyRequestsCount] = useState<number>(0);
  const [isLimitReached, setIsLimitReached] = useState<boolean>(false);
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
          name === "ph"
            ? Math.min(parseFloat(value), 14)
            : name === "moisture"
              ? Math.min(parseFloat(value), 100)
              : parseFloat(value)
        )
        : value,
    }));
  };

  const processPreviousCrops = () => {
    setSoilData((prev) => ({
      ...prev,
      previous_crops: prev.previous_crops
        .join(",")
        .split(",")
        .map((crop) => crop.trim())
        .filter(Boolean),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid) {
      setError("User authentication required");
      alert("User authentication required");
      return;
    }

    if (isLimitReached) {
      const limitMessage =
        "You have reached the daily limit of 5 recommendations. Please try again tomorrow.";
      setError(limitMessage);
      alert(limitMessage);
      return;
    }

    if (!soilData.soil_type) {
      const soilTypeMessage = "Please select a soil type";
      setError(soilTypeMessage);
      alert(soilTypeMessage);
      return;
    }

    if (soilData.moisture <= 0 || soilData.moisture > 100) {
      const moistureMessage =
        "Please enter a valid moisture level between 0 and 100";
      setError(moistureMessage);
      alert(moistureMessage);
      return;
    }

    processPreviousCrops();

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
        const errorData = await response.json();
        const errorMessage =
          errorData.error || "Failed to fetch recommendations";
        setError(errorMessage);
        alert(errorMessage);
        return; // Ensure no further execution after showing the alert
      }

      const data = await response.json();
      setRecommendations(data.Recommended_Crops);
      setFormSubmitted(true);

      incrementRequestCount(user.uid);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNewRecommendation = () => {
    setFormSubmitted(false);
    setRecommendations([]);
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

  const MotionDiv = motion.div as React.FC<
    React.HTMLAttributes<HTMLDivElement>
  >;

  return (
    <div className="min-h-screen bg-background-primary text-text-primary pt-20">
      <Navbar user={null} />
      <div className="flex justify-center items-start py-12">
        <div className="bg-background-secondary rounded-3xl shadow-2xl flex max-w-5xl w-full min-h-[700px] p-0 mt-0">
          <StepSidebar steps={steps} currentStep={currentStep} setCurrentStep={setCurrentStep} />
          <div className="flex-1 p-12">
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                >
                  <StepPersonalDetails
                    onNext={(data) => {
                      setFormData((prev) => ({ ...prev, ...data }));
                      setCurrentStep(1);
                    }}
                    defaultValues={formData}
                  />
                </motion.div>
              )}
              {currentStep === 1 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                >
                  <StepSoilCropData
                    onBack={() => setCurrentStep(0)}
                    onNext={(data) => {
                      setFormData((prev) => ({ ...prev, ...data }));
                      setCurrentStep(2);
                    }}
                    defaultValues={formData}
                  />
                </motion.div>
              )}
              {currentStep === 2 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                >
                  <StepRecommendations
                    recommendations={recommendations}
                    onBack={() => setCurrentStep(1)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoilRecommendationPage;
