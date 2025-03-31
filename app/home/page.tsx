// src/app/page.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import { useScroll } from "framer-motion";
import { ArrowRight, Leaf, LineChart, Database, Flower2 } from "lucide-react";
import { WavyBackground } from "../ui/wavy-background";

import Link from "next/link";

// Custom color theme based on the provided palette
const theme = {
  primary: "#12372A",
  secondary: "#436850",
  accent: "#494E44",
  light: "#FBFADA",
};

// RevealText component for the revealing text effect
const RevealText = ({ text }: { text: string }) => {
  return (
    <div className="flex flex-wrap overflow-hidden">
      {text.split(" ").map((word, index) => (
        <motion.span
          key={index}
          className="mr-2 mb-1"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }} // Use whileInView instead of animate
          transition={{
            delay: index * 0.1,
            duration: 0.5,
            ease: "easeInOut",
          }}
          viewport={{ once: true }} // Add this to only animate once
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

// FeatureCard Component
const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="backdrop-blur-md bg-[#436850]/20 border border-[#FBFADA]/10 rounded-xl p-6 flex flex-col items-center gap-4"
    >
      <div className="bg-[#12372A] p-3 rounded-full">{icon}</div>
      <h3 className="text-xl font-semibold text-[#FBFADA]">{title}</h3>
      <p className="text-[#FBFADA]/80 text-center">{description}</p>
    </motion.div>
  );
};

// StepCard Component
const StepCard = ({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: number * 0.1 }}
      viewport={{ once: true }}
      className="flex gap-6 items-start"
    >
      <div className="bg-[#436850] text-[#FBFADA] font-bold text-xl rounded-full w-10 h-10 flex items-center justify-center shrink-0">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-semibold text-[#FBFADA] mb-2">{title}</h3>
        <p className="text-[#FBFADA]/80">{description}</p>
      </div>
    </motion.div>
  );
};

export default function Home() {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Soil particles floating animation
  const SoilParticle = ({
    size,
    delay,
    duration,
    x,
    y,
  }: {
    size: number;
    delay: number;
    duration: number;
    x: number;
    y: number;
  }) => {
    return (
      <motion.div
        className="absolute rounded-full bg-[#FBFADA]/30"
        style={{ width: size, height: size, top: y, left: x }}
        animate={{
          y: [0, -15, 0],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );
  };

  return (
    <main className="bg-[#12372A] min-h-screen text-[#FBFADA] overflow-x-hidden">
      {/* Glassmorphic Navbar */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-6xl backdrop-blur-lg bg-[#12372A]/50 border border-[#FBFADA]/10 rounded-full px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img className="h-12 w-auto" src="logo1.jpeg" alt="Logo" />
            <span className="font-bold text-xl">Krishak</span>
          </div>
          <div className="hidden md:flex gap-8">
            <a
              href="#features"
              className="hover:text-[#FBFADA]/80 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#FBFADA]/80 transition-colors"
            >
              How It Works
            </a>
            <a href="#" className="hover:text-[#FBFADA]/80 transition-colors">
              About
            </a>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#FBFADA] text-[#12372A] px-4 py-2 rounded-full font-medium"
          >
            <Link href="/signin"> Get Started</Link>
          </motion.button>
        </div>
      </nav>

      {/* New Hero Section with Wavy Background */}
      <section className="relative" ref={ref}>
        <WavyBackground
          containerClassName="h-screen"
          colors={["#436850", "#12372A", "#494E44", "#FBFADA"]}
          waveWidth={30}
          backgroundFill="#12372A"
          blur={10}
          waveOpacity={0.3}
          className="max-w-7xl mx-auto px-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center z-10 pt-20">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#FBFADA]">
                  <RevealText text="Smart Farming with Krishak" />
                </h1>
                <div className="text-base sm:text-lg text-[#FBFADA]/80 max-w-xl">
                  <RevealText text="AI-powered crop recommendations tailored to your soil's unique properties" />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="font-bold bg-[#FBFADA] rounded-full px-6 py-3 text-[#12372A] text-base w-fit flex items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                Get Started <ArrowRight size={16} />
              </motion.button>
            </div>
            <motion.div
              className="relative h-[300px] sm:h-[350px] md:h-[400px] w-full"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="absolute top-0 left-0 right-0 bottom-0 backdrop-blur-sm bg-[#436850]/10 rounded-2xl border border-[#FBFADA]/10 overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-12 bg-[#436850]/30 flex items-center gap-2 px-4">
                  <div className="h-3 w-3 rounded-full bg-[#FBFADA]/50"></div>
                  <div className="h-3 w-3 rounded-full bg-[#FBFADA]/50"></div>
                  <div className="h-3 w-3 rounded-full bg-[#FBFADA]/50"></div>
                </div>

                <div className="p-8 pt-16">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-[#FBFADA]/70">Soil Type:</span>
                      <span className="font-medium">Clay Loam</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#FBFADA]/70">Nitrogen (N):</span>
                      <span className="font-medium">120 kg/ha</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#FBFADA]/70">Phosphorus (P):</span>
                      <span className="font-medium">85 kg/ha</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#FBFADA]/70">Potassium (K):</span>
                      <span className="font-medium">42 kg/ha</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#FBFADA]/70">pH Level:</span>
                      <span className="font-medium">6.8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#FBFADA]/70">Moisture:</span>
                      <span className="font-medium">35%</span>
                    </div>

                    <div className="pt-6">
                      <div className="font-bold mb-2 text-lg">
                        Recommended Crops:
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-[#494E44] rounded-lg">
                          <div className="font-medium">Wheat</div>
                          <div className="flex justify-between text-sm">
                            <span>Expected Yield:</span>
                            <span>4.2 tons/ha</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </WavyBackground>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#436850]/20 to-[#12372A]"></div>
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Intelligent Farming Solutions
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-[#FBFADA]/80 max-w-2xl mx-auto"
            >
              Krishak analyzes your soil data to provide personalized crop
              recommendations that maximize yield and minimize costs.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Database className="text-[#FBFADA]" size={24} />}
              title="Soil Analysis"
              description="Comprehensive analysis of NPK levels, moisture, calcium, and other crucial soil components"
            />
            <FeatureCard
              icon={<Flower2 className="text-[#FBFADA]" size={24} />}
              title="Crop Recommendations"
              description="Smart crop suggestions based on your soil profile and local climate conditions"
            />
            <FeatureCard
              icon={<LineChart className="text-[#FBFADA]" size={24} />}
              title="Cost Projections"
              description="Detailed fertilizer recommendations with expected production costs and selling prices"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-[#12372A]">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold mb-8"
              >
                How Krishak Works
              </motion.h2>

              <div className="space-y-8">
                <StepCard
                  number={1}
                  title="Submit Soil Data"
                  description="Enter your soil details including NPK levels, moisture, pH, and other parameters through our simple interface."
                />
                <StepCard
                  number={2}
                  title="AI Analysis"
                  description="Our advanced algorithms analyze your data against thousands of soil profiles and crop patterns."
                />
                <StepCard
                  number={3}
                  title="Get Recommendations"
                  description="Receive detailed crop recommendations with expected yield, market prices, and fertilizer requirements."
                />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="md:w-1/2 w-full relative mt-10 md:mt-0"
            >
              <div className="relative h-[400px] sm:h-[450px] md:h-[500px] w-full">
                <div className="absolute top-0 left-0 right-0 bottom-0 backdrop-blur-sm bg-[#436850]/10 rounded-2xl border border-[#FBFADA]/10 overflow-hidden shadow-xl">
                  <div className="absolute top-0 left-0 right-0 h-12 bg-[#436850]/30 flex items-center gap-2 px-4">
                    <div className="h-3 w-3 rounded-full bg-[#FBFADA]/50"></div>
                    <div className="h-3 w-3 rounded-full bg-[#FBFADA]/50"></div>
                    <div className="h-3 w-3 rounded-full bg-[#FBFADA]/50"></div>
                  </div>

                  <div className="p-4 sm:p-6 md:p-8 pt-16 overflow-y-auto max-h-[calc(100%-48px)]">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between">
                        <span className="text-[#FBFADA]/70">Soil Type:</span>
                        <span className="font-medium">Clay Loam</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#FBFADA]/70">Nitrogen (N):</span>
                        <span className="font-medium">120 kg/ha</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#FBFADA]/70">
                          Phosphorus (P):
                        </span>
                        <span className="font-medium">85 kg/ha</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#FBFADA]/70">
                          Potassium (K):
                        </span>
                        <span className="font-medium">42 kg/ha</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#FBFADA]/70">pH Level:</span>
                        <span className="font-medium">6.8</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#FBFADA]/70">Moisture:</span>
                        <span className="font-medium">35%</span>
                      </div>

                      <div className="pt-6">
                        <div className="font-bold mb-2 text-lg">
                          Recommended Crops:
                        </div>
                        <div className="space-y-4">
                          <div className="p-4 bg-[#494E44] rounded-lg">
                            <div className="font-medium">Wheat</div>
                            <div className="flex justify-between text-sm">
                              <span>Expected Yield:</span>
                              <span>4.2 tons/ha</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Market Price:</span>
                              <span>₹2,200/quintal</span>
                            </div>
                          </div>

                          <div className="p-4 bg-[#494E44] rounded-lg">
                            <div className="font-medium">Mustard</div>
                            <div className="flex justify-between text-sm">
                              <span>Expected Yield:</span>
                              <span>1.8 tons/ha</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Market Price:</span>
                              <span>₹5,100/quintal</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-[#FBFADA]/10 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img className="h-12 w-auto" src="logo1.jpeg" alt="" />
              <span className="font-bold">Krishak</span>
            </div>
            <div className="text-[#FBFADA]/60 text-sm">
              © {new Date().getFullYear()} Krishak. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
