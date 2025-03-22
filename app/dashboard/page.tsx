"use client";
import React, { useEffect, useState } from "react";
import { app } from "../utils/firebase";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FiHome,
  FiSettings,
  FiLogOut,
  FiPlus,
  FiEdit,
  FiList,
  FiUser,
  FiCalendar,
} from "react-icons/fi";
import { motion } from "framer-motion";

// Mock data for demonstration
const MOCK_SOIL_DATA = [
  {
    id: 1,
    name: "North Field",
    ph: 6.5,
    nitrogen: 120,
    phosphorus: 45,
    potassium: 85,
    organicMatter: 3.2,
    date: "2025-02-15",
  },
  {
    id: 2,
    name: "South Field",
    ph: 7.2,
    nitrogen: 95,
    phosphorus: 35,
    potassium: 90,
    organicMatter: 2.8,
    date: "2025-03-01",
  },
];

const MOCK_RECOMMENDED_CROPS = [
  {
    id: 1,
    name: "Wheat",
    confidence: 95,
    soilMatch: "Excellent",
    yield: "High",
    profit: "$$$",
  },
  {
    id: 2,
    name: "Corn",
    confidence: 90,
    soilMatch: "Very Good",
    yield: "High",
    profit: "$$$",
  },
  {
    id: 3,
    name: "Soybeans",
    confidence: 85,
    soilMatch: "Good",
    yield: "Medium",
    profit: "$$",
  },
  {
    id: 4,
    name: "Rice",
    confidence: 80,
    soilMatch: "Good",
    yield: "Medium",
    profit: "$$",
  },
  {
    id: 5,
    name: "Barley",
    confidence: 75,
    soilMatch: "Fair",
    yield: "Medium",
    profit: "$$",
  },
];

const MOCK_HISTORY = [
  {
    id: 1,
    date: "2025-03-01",
    fieldName: "North Field",
    cropRecommended: "Wheat",
    actualCrop: "Wheat",
    success: true,
  },
  {
    id: 2,
    date: "2024-09-15",
    fieldName: "South Field",
    cropRecommended: "Corn",
    actualCrop: "Corn",
    success: true,
  },
  {
    id: 3,
    date: "2024-03-10",
    fieldName: "North Field",
    cropRecommended: "Soybeans",
    actualCrop: "Rice",
    success: false,
  },
];

const auth = getAuth(app);

const DashboardPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [soilData, setSoilData] = useState(MOCK_SOIL_DATA);
  const [recommendedCrops, setRecommendedCrops] = useState(
    MOCK_RECOMMENDED_CROPS
  );
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        router.push("/signin");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      router.push("/signin");
    });
  };

  const handleAddSoilData = () => {
    // In a real app, this would navigate to a form or open a modal
    alert("Navigate to add soil data form");
  };

  const handleEditSoilData = (id: number) => {
    // In a real app, this would navigate to a form with the soil data pre-filled
    alert(`Edit soil data with ID: ${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // This should not happen due to the redirect in useEffect, but just in case
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <motion.div
        initial={{ x: sidebarOpen ? 0 : -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className="w-72 bg-black border-r border-gray-800 flex flex-col"
      >
        <div className="p-6 border-b border-gray-800">
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
        </div>

        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
              {user.displayName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-medium truncate">{user.displayName}</p>
              <p className="text-sm text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              <FiHome className="text-green-500" />
              <span>Dashboard</span>
            </Link>

            <button
              onClick={handleAddSoilData}
              className="w-full flex items-center space-x-3 p-3 rounded-lg text-white hover:bg-gray-800 transition-colors"
            >
              <FiPlus className="text-green-500" />
              <span>
                {soilData.length > 0 ? "Add New Soil Data" : "Add Soil Data"}
              </span>
            </button>

            {soilData.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 pl-3">
                  <FiList className="text-green-500" />
                  <span className="text-sm text-gray-400">Soil Data</span>
                </div>

                {soilData.map((data) => (
                  <button
                    key={data.id}
                    onClick={() => handleEditSoilData(data.id)}
                    className="w-full flex items-center justify-between p-3 pl-8 rounded-lg text-white hover:bg-gray-800 transition-colors"
                  >
                    <span className="truncate">{data.name}</span>
                    <FiEdit className="text-gray-400 hover:text-green-500" />
                  </button>
                ))}
              </div>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link
            href="/settings"
            className="flex items-center space-x-3 p-3 rounded-lg text-white hover:bg-gray-800 transition-colors"
          >
            <FiSettings className="text-green-500" />
            <span>Settings</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-lg text-white hover:bg-gray-800 transition-colors"
          >
            <FiLogOut className="text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-black border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold">Dashboard</h1>
            </div>
            <div className="w-6 h-6"></div> {/* Empty div for flex spacing */}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-6">
          {/* Alert if no soil data */}
          {soilData.length === 0 && (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-6 flex items-center">
              <svg
                className="w-6 h-6 text-yellow-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-yellow-300 font-medium">
                  No soil data available
                </p>
                <p className="text-yellow-200/70 text-sm">
                  Please add soil data to get crop recommendations
                </p>
              </div>
              <button
                onClick={handleAddSoilData}
                className="ml-auto bg-yellow-700 hover:bg-yellow-600 text-white rounded-lg px-4 py-2 text-sm transition-colors"
              >
                Add Soil Data
              </button>
            </div>
          )}

          {/* Recommended Crops Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recommended Crops</h2>
              <Link
                href="/recommendations"
                className="text-green-500 hover:text-green-400 text-sm flex items-center transition-colors"
              >
                View All
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {soilData.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiPlus className="text-green-500 text-xl" />
                </div>
                <h3 className="text-xl font-medium mb-2">
                  No Recommendations Yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Add soil data to get personalized crop recommendations
                </p>
                <button
                  onClick={handleAddSoilData}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-3 transition-colors"
                >
                  Add Soil Data
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {recommendedCrops.map((crop) => (
                  <div
                    key={crop.id}
                    className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-green-500 transition-colors"
                  >
                    <div className="h-32 bg-gray-700 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Placeholder for crop image */}
                        <span className="text-4xl">
                          {crop.name === "Wheat"
                            ? "🌾"
                            : crop.name === "Corn"
                            ? "🌽"
                            : crop.name === "Soybeans"
                            ? "🫘"
                            : crop.name === "Rice"
                            ? "🍚"
                            : "🌱"}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2 bg-green-500 text-xs text-white rounded-full px-2 py-1 font-medium">
                        {crop.confidence}% Match
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{crop.name}</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex flex-col">
                          <span className="text-gray-400">Soil Match</span>
                          <span className="font-medium">{crop.soilMatch}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-400">Yield</span>
                          <span className="font-medium">{crop.yield}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-400">Profit</span>
                          <span className="font-medium">{crop.profit}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* History Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recommendation History</h2>
              <Link
                href="/history"
                className="text-green-500 hover:text-green-400 text-sm flex items-center transition-colors"
              >
                View Full History
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {history.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCalendar className="text-green-500 text-xl" />
                </div>
                <h3 className="text-xl font-medium mb-2">No History Yet</h3>
                <p className="text-gray-400">
                  Your recommendation history will appear here
                </p>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-900">
                        <th className="text-left py-3 px-4 font-medium">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          Field
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          Recommended
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          Actual Crop
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          Result
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {history.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-750">
                          <td className="py-3 px-4">{item.date}</td>
                          <td className="py-3 px-4">{item.fieldName}</td>
                          <td className="py-3 px-4">{item.cropRecommended}</td>
                          <td className="py-3 px-4">{item.actualCrop}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.success
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.success ? "Success" : "Different Choice"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
