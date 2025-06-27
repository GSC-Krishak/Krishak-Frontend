"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { app } from "../utils/firebase";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { theme } from "../utils/theme";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

// Define types for our data
interface CropRecommendation {
  Commodity: string;
  Compatibility: string;
  Profitability: number;
  Fertilizer_Cost: number;
  Corrective_Actions?: {
    [key: string]: string;
  };
  Fertilizer_Adjustments: {
    "Calcium (Ca)": number;
    "Nitrogen (N)": number;
    "Potassium (K)": number;
    "Magnesium (Mg)": number;
    "Phosphorus (P)": number;
  };
}

interface RecommendationResponse {
  Recommended_Crops: CropRecommendation[];
}

interface SoilRequest {
  k: number;
  n: number;
  p: number;
  mg: number;
  ph: number;
  state: string;
  userId: string;
  calcium: number;
  district: string;
  previous_crops: string[];
}

interface Recommendation {
  id: string;
  request: SoilRequest;
  response: RecommendationResponse;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Colors for the charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
];
const COMPATIBILITY_COLORS = {
  Best: "#22c55e",
  Good: "#3b82f6",
  "Not Best": "#f59e0b",
  "Not Recommended": "#ef4444",
};

const Dashboard: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [mostRecentRec, setMostRecentRec] = useState<Recommendation | null>(
    null
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [hoveredCrop, setHoveredCrop] = useState<CropRecommendation | null>(
    null
  );
  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push("/signin");
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.uid) {
        console.error("User ID is undefined. Cannot fetch recommendations.");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/getDataDashboard`,
          {
            userId: user.uid,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = response.data as Recommendation[];

        const sortedData = [...data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setRecommendations(sortedData);

        if (sortedData.length > 0) {
          setMostRecentRec(sortedData[0]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setLoading(false);
      }
    };

    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const formatCropName = (name: string) => {
    if (name.includes("No Suitable Crop")) {
      return "No Suitable Crop";
    }
    if (name.includes("(AI Recommended)")) {
      return name.replace(" (AI Recommended)", "");
    }
    return name;
  };

  const prepareChartData = () => {
    if (!mostRecentRec) return [];

    return mostRecentRec.response.Recommended_Crops.map((crop) => ({
      name: formatCropName(crop.Commodity),
      profitability: crop.Profitability,
      fertilizerCost: crop.Fertilizer_Cost,
      estimatedProfit: crop.Profitability - crop.Fertilizer_Cost,
      compatibility: crop.Compatibility,
    }));
  };

  const getCompatibilityBadge = (compatibility: string) => {
    const color =
      {
        Best: theme.secondary,
        Good: theme.accent,
        "Not Best": "#f59e0b",
        "Not Recommended": "#ef4444",
      }[compatibility] || theme.light;

    return (
      <span
        className="text-xs font-medium px-2.5 py-0.5 rounded"
        style={{
          backgroundColor: color,
          color: theme.light,
        }}
      >
        {compatibility}
      </span>
    );
  };

  const renderCropDetailCard = (crop: CropRecommendation, index: number) => {
    return (
      <div
        key={`${crop.Commodity}-${index}`}
        className="border rounded-md p-4 hover:shadow-lg transition-all"
        style={{
          backgroundColor: theme.primary,
          borderColor: `${theme.accent}80`,
          borderWidth: "2px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          height: hoveredCrop === crop ? "auto" : "140px",
          overflow: "hidden",
        }}
        onMouseEnter={() => setHoveredCrop(crop)}
        onMouseLeave={() => setHoveredCrop(null)}
      >
        <div className="flex justify-between">
          <h4 className="text-md font-medium" style={{ color: theme.light }}>
            {formatCropName(crop.Commodity)}
          </h4>
          {getCompatibilityBadge(crop.Compatibility)}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p style={{ color: `${theme.light}99` }}>Profitability</p>
            <p className="font-medium" style={{ color: theme.light }}>
              ₹{crop.Profitability}
            </p>
          </div>
          <div>
            <p style={{ color: `${theme.light}99` }}>Fertilizer Cost</p>
            <p className="font-medium" style={{ color: theme.light }}>
              ₹{crop.Fertilizer_Cost}
            </p>
          </div>
        </div>

        {/* Fertilizer details shown on hover - directly on the card */}
        {hoveredCrop === crop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 pt-3"
            style={{ borderTop: `1px dashed ${theme.light}50` }}
          >
            <h5
              className="text-sm font-medium mb-2"
              style={{ color: theme.light }}
            >
              Fertilizer Adjustments
            </h5>

            <div className="space-y-1">
              {crop.Fertilizer_Adjustments &&
                Object.entries(crop.Fertilizer_Adjustments).map(
                  ([key, value], idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-xs py-1"
                      style={{ borderTop: `1px solid ${theme.light}20` }}
                    >
                      <span style={{ color: `${theme.light}CC` }}>{key}</span>
                      <span
                        className="font-medium"
                        style={{ color: theme.light }}
                      >
                        {typeof value === "number" ? value : value.toString()}
                      </span>
                    </div>
                  )
                )}

              {crop.Corrective_Actions &&
                Object.keys(crop.Corrective_Actions).length > 0 && (
                  <div
                    className="mt-3 pt-2"
                    style={{ borderTop: `1px solid ${theme.light}40` }}
                  >
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: theme.light }}
                    >
                      Corrective Actions:
                    </p>
                    {Object.entries(crop.Corrective_Actions).map(
                      ([key, value], idx) => (
                        <p
                          key={idx}
                          className="text-xs mt-1"
                          style={{ color: `${theme.light}CC` }}
                        >
                          <span
                            className="font-medium"
                            style={{ color: theme.light }}
                          >
                            {key}:
                          </span>{" "}
                          {value}
                        </p>
                      )
                    )}
                  </div>
                )}
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  const renderHistoryCard = (crop: CropRecommendation, index: number) => {
    return (
      <div
        key={index}
        className="border-2 rounded-md p-4 hover:shadow-lg transition-all"
        style={{
          backgroundColor: theme.primary,
          borderColor: index === 0 ? "#8AFF8A" : `${theme.light}50`,
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          height: hoveredCrop === crop ? "auto" : "120px",
          overflow: "hidden",
        }}
        onMouseEnter={() => setHoveredCrop(crop)}
        onMouseLeave={() => setHoveredCrop(null)}
      >
        <div className="flex justify-between items-center">
          <p className="font-medium" style={{ color: theme.light }}>
            {formatCropName(crop.Commodity)}
          </p>
          {getCompatibilityBadge(crop.Compatibility)}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p style={{ color: `${theme.light}90` }}>Profit</p>
            <p className="font-bold" style={{ color: "#8AFF8A" }}>
              ₹{crop.Profitability}
            </p>
          </div>
          <div>
            <p style={{ color: `${theme.light}90` }}>Cost</p>
            <p className="font-bold" style={{ color: "#FF9A8A" }}>
              ₹{crop.Fertilizer_Cost}
            </p>
          </div>
        </div>

        {/* Fertilizer details shown on hover - directly on the card */}
        {hoveredCrop === crop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 pt-3"
            style={{ borderTop: `1px dashed ${theme.light}50` }}
          >
            <h5
              className="text-sm font-medium mb-2"
              style={{ color: theme.light }}
            >
              Fertilizer Adjustments
            </h5>

            <div className="space-y-1">
              {crop.Fertilizer_Adjustments &&
                Object.entries(crop.Fertilizer_Adjustments).map(
                  ([key, value], idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-xs py-1"
                      style={{ borderTop: `1px solid ${theme.light}20` }}
                    >
                      <span style={{ color: `${theme.light}CC` }}>{key}</span>
                      <span
                        className="font-medium"
                        style={{ color: theme.light }}
                      >
                        {typeof value === "number" ? value : value.toString()}
                      </span>
                    </div>
                  )
                )}

              {crop.Corrective_Actions &&
                Object.keys(crop.Corrective_Actions).length > 0 && (
                  <div
                    className="mt-3 pt-2"
                    style={{ borderTop: `1px solid ${theme.light}40` }}
                  >
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: theme.light }}
                    >
                      Corrective Actions:
                    </p>
                    {Object.entries(crop.Corrective_Actions).map(
                      ([key, value], idx) => (
                        <p
                          key={idx}
                          className="text-xs mt-1"
                          style={{ color: `${theme.light}CC` }}
                        >
                          <span
                            className="font-medium"
                            style={{ color: theme.light }}
                          >
                            {key}:
                          </span>{" "}
                          {value}
                        </p>
                      )
                    )}
                  </div>
                )}
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className="flex justify-center items-center h-screen"
        style={{ backgroundColor: theme.primary }}
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderColor: theme.light }}
        ></div>
      </div>
    );
  }

  const chartData = prepareChartData();

  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      <Navbar user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-20">
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-border">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "dashboard" ? "border-brand-accent text-brand-accent" : "border-transparent text-text-secondary"}`}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "history" ? "border-brand-accent text-brand-accent" : "border-transparent text-text-secondary"}`}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
          </nav>
        </div>

        {activeTab === "dashboard" ? (
          <>
            {recommendations.length === 0 ? (
              <div className="text-center py-10">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={theme.light}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3
                  className="mt-2 text-sm font-medium"
                  style={{ color: theme.light }}
                >
                  No recommendations yet
                </h3>
                <p
                  className="mt-1 text-sm"
                  style={{ color: `${theme.light}CC` }}
                >
                  Get started by analyzing your soil data.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Most Recent Recommendation Overview Card */}
                {mostRecentRec && (
                  <div
                    className="overflow-hidden shadow-xl rounded-lg border-2"
                    style={{
                      backgroundColor: theme.secondary,
                      borderColor: theme.accent,
                    }}
                  >
                    <div className="px-5 py-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2
                            className="text-xl font-bold"
                            style={{ color: theme.light }}
                          >
                            Latest Recommendation
                          </h2>
                          <p style={{ color: theme.light }}>
                            {new Date(
                              mostRecentRec.createdAt
                            ).toLocaleDateString()}{" "}
                            (
                            {formatDistanceToNow(
                              new Date(mostRecentRec.createdAt),
                              {
                                addSuffix: true,
                              }
                            )}
                            )
                          </p>
                        </div>
                        <div
                          className="rounded-md p-3"
                          style={{ backgroundColor: theme.primary }}
                        >
                          <p
                            className="text-sm font-medium"
                            style={{ color: theme.light }}
                          >
                            <span className="font-bold">Soil pH:</span>{" "}
                            {mostRecentRec.request.ph}
                          </p>
                          <p className="text-sm" style={{ color: theme.light }}>
                            <span className="font-bold">Location:</span>{" "}
                            {mostRecentRec.request.district},{" "}
                            {mostRecentRec.request.state}
                          </p>
                        </div>
                      </div>

                      {/* Display top recommendation */}
                      <div
                        className="mt-4 p-4 rounded-lg border border-dashed"
                        style={{
                          backgroundColor: theme.accent,
                          borderColor: theme.light,
                        }}
                      >
                        <h3
                          className="text-lg font-semibold mb-3"
                          style={{ color: theme.light }}
                        >
                          Top Recommendation
                        </h3>
                        {renderCropDetailCard(
                          mostRecentRec.response.Recommended_Crops[0],
                          0
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Charts */}
                <div className="space-y-4">
                  <h3
                    className="text-xl font-bold"
                    style={{ color: theme.light }}
                  >
                    Crop Comparison
                  </h3>
                  <div
                    className="p-5 rounded-lg shadow-lg border-2"
                    style={{
                      backgroundColor: theme.secondary,
                      borderColor: theme.accent,
                    }}
                  >
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={chartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 70,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={theme.light}
                          opacity={0.2}
                        />
                        <XAxis
                          dataKey="name"
                          stroke={theme.light}
                          tick={{ fill: theme.light, fontSize: 12 }}
                          tickFormatter={(value) => {
                            return value.length > 10
                              ? value.substring(0, 10) + "..."
                              : value;
                          }}
                          height={60}
                          angle={-45}
                          textAnchor="end"
                        />
                        <YAxis
                          stroke={theme.light}
                          tick={{ fill: theme.light }}
                          tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip
                          cursor={{ fill: `${theme.primary}80` }}
                          contentStyle={{
                            backgroundColor: theme.primary,
                            color: theme.light,
                            border: `2px solid ${theme.accent}`,
                            borderRadius: "8px",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                          }}
                          labelStyle={{
                            color: theme.light,
                            fontWeight: "bold",
                            borderBottom: `1px solid ${theme.accent}`,
                          }}
                          formatter={(value) => [`₹${value}`, ""]}
                        />
                        <Legend
                          wrapperStyle={{
                            color: theme.light,
                            paddingTop: 20,
                          }}
                          formatter={(value) => (
                            <span style={{ color: theme.light, fontSize: 14 }}>
                              {value}
                            </span>
                          )}
                        />
                        <Bar
                          dataKey="profitability"
                          name="Profitability (₹)"
                          fill="#8AFF8A"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="fertilizerCost"
                          name="Fertilizer Cost (₹)"
                          fill="#FF9A8A"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Recommended crops list */}
                  <div
                    className="border-2 rounded-lg overflow-hidden shadow-lg"
                    style={{
                      backgroundColor: theme.secondary,
                      borderColor: theme.accent,
                    }}
                  >
                    <div
                      className="px-4 py-3"
                      style={{
                        backgroundColor: theme.accent,
                        color: theme.light,
                      }}
                    >
                      <h4 className="text-md font-medium">
                        Alternative Recommendations
                      </h4>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mostRecentRec?.response.Recommended_Crops.slice(1).map(
                        (crop, index) => renderCropDetailCard(crop, index + 1)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: theme.light }}
            >
              Recommendation History
            </h2>

            {recommendations.length === 0 ? (
              <div
                className="p-8 rounded-lg text-center"
                style={{
                  backgroundColor: `${theme.secondary}50`,
                  borderColor: theme.light,
                }}
              >
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={theme.light}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-4 text-lg" style={{ color: theme.light }}>
                  No recommendation history available.
                </p>
              </div>
            ) : (
              recommendations.map((rec, recIndex) => (
                <div
                  key={rec.id}
                  className="overflow-hidden rounded-lg shadow-lg border-2 mb-6"
                  style={{
                    backgroundColor: theme.secondary,
                    borderColor: theme.accent,
                  }}
                >
                  <div
                    className="px-6 py-4 border-b-2"
                    style={{
                      backgroundColor: theme.accent,
                      borderColor: `${theme.light}50`,
                    }}
                  >
                    <div className="flex flex-wrap justify-between items-center">
                      <div>
                        <h3
                          className="text-lg font-semibold"
                          style={{ color: theme.light }}
                        >
                          {formatDistanceToNow(new Date(rec.createdAt), {
                            addSuffix: true,
                          })}
                        </h3>
                        <p style={{ color: theme.light }}>
                          {new Date(rec.createdAt).toLocaleDateString()} •{" "}
                          {rec.request.district}, {rec.request.state}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div
                          className="text-sm rounded-md px-3 py-1 mr-2 border"
                          style={{
                            backgroundColor: theme.primary,
                            borderColor: `${theme.light}50`,
                          }}
                        >
                          <span style={{ color: theme.light }}>
                            pH: <strong>{rec.request.ph}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-5">
                    <div className="mb-4">
                      <h4
                        className="text-md font-medium mb-2"
                        style={{ color: theme.light }}
                      >
                        Previous crops
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {rec.request.previous_crops.map((crop, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: theme.primary,
                              color: theme.light,
                              border: `1px solid ${theme.accent}`,
                            }}
                          >
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>

                    <h4
                      className="text-lg font-medium mb-3"
                      style={{ color: theme.light }}
                    >
                      Recommendations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {rec.response.Recommended_Crops.map((crop, index) =>
                        renderHistoryCard(crop, index)
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
