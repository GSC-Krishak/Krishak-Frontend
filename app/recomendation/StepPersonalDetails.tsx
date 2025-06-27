import React, { useState } from "react";

interface PersonalDetailsForm {
    fullName: string;
    mobile: string;
    email: string;
    state: string;
    district: string;
    landArea: string;
    landUnit: string;
    soilType: string;
}

const STATES = ["Maharashtra", "Uttar Pradesh", "Punjab", "Karnataka", "West Bengal"];
const DISTRICTS = {
    Maharashtra: ["Pune", "Nashik", "Nagpur", "Aurangabad"],
    // Add demo data for other states as needed
};
const SOIL_TYPES = ["Alluvial", "Black", "Red", "Laterite", "Sandy", "Loamy"];

const defaultUnits = ["Acres", "Hectares"];

export default function StepPersonalDetails({ onNext, defaultValues = {} as Partial<PersonalDetailsForm> }) {
    const [form, setForm] = useState<PersonalDetailsForm>({
        fullName: defaultValues.fullName || "",
        mobile: defaultValues.mobile || "",
        email: defaultValues.email || "",
        state: defaultValues.state || "",
        district: defaultValues.district || "",
        landArea: defaultValues.landArea || "",
        landUnit: defaultValues.landUnit || defaultUnits[0],
        soilType: defaultValues.soilType || "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.fullName) errs.fullName = "Full Name is required.";
        if (!form.mobile) errs.mobile = "Mobile Number is required.";
        if (!form.state) errs.state = "State is required.";
        if (!form.district) errs.district = "District is required.";
        if (!form.landArea) errs.landArea = "Land Area is required.";
        if (!form.soilType) errs.soilType = "Soil Type is required.";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onNext(form);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-background-secondary rounded-2xl p-8 max-w-xl mx-auto">
            <h4 className="font-montserrat font-semibold text-2xl mb-8 text-brand-primary">Your Farm & Contact Information</h4>
            <div className="mb-5">
                <label className="font-lato text-text-primary font-medium">Full Name</label>
                <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full rounded-lg border border-border py-3 px-4 mt-2 outline-none text-base bg-background-primary text-text-primary"
                />
                {errors.fullName && <div className="text-error text-xs mt-1">{errors.fullName}</div>}
            </div>
            <div className="mb-5">
                <label className="font-lato text-text-primary font-medium">Mobile Number</label>
                <input
                    type="tel"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="e.g., 9876543210"
                    className="w-full rounded-lg border border-border py-3 px-4 mt-2 outline-none text-base bg-background-primary text-text-primary"
                />
                {errors.mobile && <div className="text-error text-xs mt-1">{errors.mobile}</div>}
            </div>
            <div className="mb-5">
                <label className="font-lato text-text-primary font-medium">Email Address (Optional)</label>
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="e.g., you@example.com"
                    className="w-full rounded-lg border border-border py-3 px-4 mt-2 outline-none text-base bg-background-primary text-text-primary"
                />
            </div>
            <div className="mb-5">
                <label className="font-lato text-text-primary font-medium">State</label>
                <select
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border py-3 px-4 mt-2 text-base bg-background-primary text-text-primary"
                >
                    <option value="">Select your State</option>
                    {STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                    ))}
                </select>
                {errors.state && <div className="text-error text-xs mt-1">{errors.state}</div>}
            </div>
            <div className="mb-5">
                <label className="font-lato text-text-primary font-medium">District</label>
                <select
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border py-3 px-4 mt-2 text-base bg-background-primary text-text-primary"
                >
                    <option value="">Select your District</option>
                    {(DISTRICTS[form.state] || []).map((district) => (
                        <option key={district} value={district}>{district}</option>
                    ))}
                </select>
                {errors.district && <div className="text-error text-xs mt-1">{errors.district}</div>}
            </div>
            <div className="mb-5 flex gap-4">
                <div className="flex-1">
                    <label className="font-lato text-text-primary font-medium">Land Area</label>
                    <input
                        type="number"
                        name="landArea"
                        value={form.landArea}
                        onChange={handleChange}
                        placeholder="Enter area"
                        className="w-full rounded-lg border border-border py-3 px-4 mt-2 outline-none text-base bg-background-primary text-text-primary"
                    />
                    {errors.landArea && <div className="text-error text-xs mt-1">{errors.landArea}</div>}
                </div>
                <div className="w-32">
                    <label className="font-lato text-text-primary font-medium">Unit</label>
                    <select
                        name="landUnit"
                        value={form.landUnit}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-border py-3 px-4 mt-2 text-base bg-background-primary text-text-primary"
                    >
                        {defaultUnits.map((unit) => (
                            <option key={unit} value={unit}>{unit}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="mb-8">
                <label className="font-lato text-text-primary font-medium">Soil Type</label>
                <select
                    name="soilType"
                    value={form.soilType}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border py-3 px-4 mt-2 text-base bg-background-primary text-text-primary"
                >
                    <option value="">Select soil type</option>
                    {SOIL_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                {errors.soilType && <div className="text-error text-xs mt-1">{errors.soilType}</div>}
            </div>
            <button
                type="submit"
                className="w-full bg-brand-accent text-brand-primary border-none rounded-2xl py-4 font-lato font-bold text-lg shadow-md hover:bg-brand-primary hover:text-background-primary transition-all"
            >
                Next
            </button>
        </form>
    );
} 