"use client";
import React, { useState, useEffect } from "react";
import Script from "next/script";

// Access the API key from the environment variable
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

const SoilForm = () => {
  const [formData, setFormData] = useState({
    n: "",
    p: "",
    k: "",
    location: "",
    magnesium: "",
    calcium: "",
    moisture: "",
  });

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Define the initAutocomplete function
  useEffect(() => {
    window.initAutocomplete = () => {
      setScriptLoaded(true);
      initAutocomplete();
    };
  }, []);

  const initAutocomplete = () => {
    const locationInput = document.getElementById(
      "location"
    ) as HTMLInputElement;

    const locationAutocomplete = new google.maps.places.Autocomplete(
      locationInput,
      {
        types: ["geocode"],
        componentRestrictions: { country: "in" },
      }
    );

    locationAutocomplete.addListener("place_changed", () => {
      const place = locationAutocomplete.getPlace();
      const locationName = place.formatted_address;

      if (locationName) {
        setFormData((prevData) => ({
          ...prevData,
          location: locationName,
        }));
      }
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "location") {
      setFormData({
        ...formData,
        location: value,
      });
    } else if (
      ["n", "p", "k", "magnesium", "calcium", "moisture"].includes(name)
    ) {
      const numValue = value === "" ? "" : Number(value);

      if (numValue === "" || (numValue >= 0 && numValue <= 100)) {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.location) {
      alert("Please select a valid location.");
      return;
    }

    try {
      const response = await fetch("https://api.example.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Form submitted successfully!");
      } else {
        alert("Failed to submit the form.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&callback=initAutocomplete`}
        strategy="afterInteractive"
        onError={() => {
          console.error("Failed to load Google Maps script");
          setLoadError("Failed to load Google Maps. Please refresh the page.");
        }}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <div className="bg-gray-800 backdrop-blur-lg bg-opacity-80 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-400 py-6 px-8">
              <h2 className="text-2xl font-bold text-white text-center tracking-wide">
                Soil Analysis Data Form
              </h2>
              <p className="text-green-100 text-center mt-1">
                Enter your soil composition details
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="n"
                    className="text-sm font-medium text-green-300"
                  >
                    Nitrogen (N) %
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="n"
                      name="n"
                      value={formData.n}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="0-100%"
                      min="0"
                      max="100"
                      step="0.01"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-400">%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="p"
                    className="text-sm font-medium text-green-300"
                  >
                    Phosphorus (P) %
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="p"
                      name="p"
                      value={formData.p}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="0-100%"
                      min="0"
                      max="100"
                      step="0.01"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-400">%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="k"
                    className="text-sm font-medium text-green-300"
                  >
                    Potassium (K) %
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="k"
                      name="k"
                      value={formData.k}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="0-100%"
                      min="0"
                      max="100"
                      step="0.01"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-400">%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="magnesium"
                    className="text-sm font-medium text-green-300"
                  >
                    Magnesium (Mg) %
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="magnesium"
                      name="magnesium"
                      value={formData.magnesium}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="0-100%"
                      min="0"
                      max="100"
                      step="0.01"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-400">%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="calcium"
                    className="text-sm font-medium text-green-300"
                  >
                    Calcium (Ca) %
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="calcium"
                      name="calcium"
                      value={formData.calcium}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="0-100%"
                      min="0"
                      max="100"
                      step="0.01"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-400">%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="moisture"
                    className="text-sm font-medium text-green-300"
                  >
                    Moisture %
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="moisture"
                      name="moisture"
                      value={formData.moisture}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="0-100%"
                      min="0"
                      max="100"
                      step="0.01"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-400">%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <label
                  htmlFor="location"
                  className="text-sm font-medium text-green-300"
                >
                  Location
                </label>
                <div className="relative">
                  <input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div className="mt-10">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-medium py-4 px-6 rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 transform hover:-translate-y-0.5 transition-all duration-150 ease-in-out"
                  disabled={!scriptLoaded || !formData.location}
                >
                  Analyze Soil Composition
                </button>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-400">
            All data is processed securely and used to provide accurate
            analysis.
          </p>
        </div>
      </div>
    </>
  );
};

export default SoilForm;
