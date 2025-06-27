import React, { useState } from "react";

const PREV_CROPS = ["Wheat", "Rice", "Sugarcane", "Cotton", "Maize", "Vegetables", "None"];

export default function StepSoilCropData({ onNext, onBack, defaultValues }) {
    const [form, setForm] = useState({
        soilReport: null,
        n: defaultValues.n || "",
        p: defaultValues.p || "",
        k: defaultValues.k || "",
        moisture: defaultValues.moisture || "",
        ph: defaultValues.ph || "",
        prevCrop: defaultValues.prevCrop || "",
    });
    const [entryMode, setEntryMode] = useState<'upload' | 'manual'>('upload');
    const [errors, setErrors] = useState({});

    const handleFileChange = (e) => {
        setForm((prev) => ({ ...prev, soilReport: e.target.files[0] }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const errs = {};
        if (entryMode === 'upload' && !form.soilReport) errs.soilReport = "Please upload a report or switch to manual entry.";
        if (entryMode === 'manual') {
            if (!form.n) errs.n = "Required";
            if (!form.p) errs.p = "Required";
            if (!form.k) errs.k = "Required";
            if (!form.moisture) errs.moisture = "Required";
            if (!form.ph) errs.ph = "Required";
        }
        if (!form.prevCrop) errs.prevCrop = "Required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onNext(form);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "0 auto" }}>
            <h4 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: '#333', fontSize: 24, marginBottom: 32 }}>
                Provide Your Soil Report & Farming History
            </h4>
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <button
                    type="button"
                    onClick={() => setEntryMode('upload')}
                    style={{
                        flex: 1,
                        background: entryMode === 'upload' ? '#8DD256' : '#fff',
                        color: entryMode === 'upload' ? '#fff' : '#2A6B46',
                        border: '2px solid #8DD256',
                        borderRadius: 12,
                        padding: '12px 0',
                        fontWeight: 700,
                        fontFamily: 'Lato, sans-serif',
                        fontSize: 16,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                    }}
                >
                    Upload Soil Report
                </button>
                <button
                    type="button"
                    onClick={() => setEntryMode('manual')}
                    style={{
                        flex: 1,
                        background: entryMode === 'manual' ? '#8DD256' : '#fff',
                        color: entryMode === 'manual' ? '#fff' : '#2A6B46',
                        border: '2px solid #8DD256',
                        borderRadius: 12,
                        padding: '12px 0',
                        fontWeight: 700,
                        fontFamily: 'Lato, sans-serif',
                        fontSize: 16,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                    }}
                >
                    Enter Manually
                </button>
            </div>
            {entryMode === 'upload' && (
                <div style={{ marginBottom: 20 }}>
                    <label style={{ fontFamily: 'Lato, sans-serif', color: '#333', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                        Upload Soil Report (Image/PDF)
                        <span style={{ marginLeft: 8, cursor: 'pointer' }} title="If no report, enter values manually.">
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#EBF4E0" /><text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="14" fill="#2A6B46">?</text></svg>
                        </span>
                    </label>
                    <div style={{ border: '2px dashed #E0E0E0', borderRadius: 8, padding: 24, textAlign: 'center', background: '#FBFADA', marginTop: 8 }}>
                        <input type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} id="soil-upload" onChange={handleFileChange} />
                        <label htmlFor="soil-upload" style={{ cursor: 'pointer', color: '#2A6B46', fontWeight: 600 }}>
                            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginRight: 8 }}><path d="M12 16v-8m0 0l-4 4m4-4l4 4" stroke="#8DD256" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><rect x="3" y="3" width="18" height="18" rx="4" stroke="#8DD256" strokeWidth="2" /></svg>
                            Drag & drop files here or click to browse.
                        </label>
                        <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>Supported formats: JPG, PNG, PDF</div>
                    </div>
                    {errors.soilReport && <div style={{ color: "#d32f2f", fontSize: 13 }}>{errors.soilReport}</div>}
                </div>
            )}
            {entryMode === 'manual' && (
                <div style={{ marginBottom: 20, background: '#F8FDF5', borderRadius: 8, padding: 16 }}>
                    <label style={{ fontFamily: 'Lato, sans-serif', color: '#333', fontWeight: 500 }}>Enter Soil Values Manually:</label>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <input type="number" name="n" value={form.n} onChange={handleChange} placeholder="N (kg/acre)" style={{ flex: 1, borderRadius: 8, border: '1px solid #E0E0E0', padding: '12px 16px', fontSize: 16 }} />
                        <input type="number" name="p" value={form.p} onChange={handleChange} placeholder="P (kg/acre)" style={{ flex: 1, borderRadius: 8, border: '1px solid #E0E0E0', padding: '12px 16px', fontSize: 16 }} />
                        <input type="number" name="k" value={form.k} onChange={handleChange} placeholder="K (kg/acre)" style={{ flex: 1, borderRadius: 8, border: '1px solid #E0E0E0', padding: '12px 16px', fontSize: 16 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <input type="number" name="moisture" value={form.moisture} onChange={handleChange} placeholder="Moisture (%)" style={{ flex: 1, borderRadius: 8, border: '1px solid #E0E0E0', padding: '12px 16px', fontSize: 16 }} />
                        <input type="number" name="ph" value={form.ph} onChange={handleChange} placeholder="pH (0-14)" style={{ flex: 1, borderRadius: 8, border: '1px solid #E0E0E0', padding: '12px 16px', fontSize: 16 }} />
                    </div>
                    {errors.n && <div style={{ color: "#d32f2f", fontSize: 13 }}>{errors.n}</div>}
                    {errors.p && <div style={{ color: "#d32f2f", fontSize: 13 }}>{errors.p}</div>}
                    {errors.k && <div style={{ color: "#d32f2f", fontSize: 13 }}>{errors.k}</div>}
                    {errors.moisture && <div style={{ color: "#d32f2f", fontSize: 13 }}>{errors.moisture}</div>}
                    {errors.ph && <div style={{ color: "#d32f2f", fontSize: 13 }}>{errors.ph}</div>}
                </div>
            )}
            <div style={{ marginBottom: 32 }}>
                <label style={{ fontFamily: 'Lato, sans-serif', color: '#333', fontWeight: 500 }}>Previous Crop Grown</label>
                <select name="prevCrop" value={form.prevCrop} onChange={handleChange} style={{ width: "100%", borderRadius: 8, border: '1px solid #E0E0E0', padding: '12px 16px', fontSize: 16, marginTop: 6 }}>
                    <option value="">Select previous crop</option>
                    {PREV_CROPS.map((crop) => (
                        <option key={crop} value={crop}>{crop}</option>
                    ))}
                </select>
                {errors.prevCrop && <div style={{ color: "#d32f2f", fontSize: 13 }}>{errors.prevCrop}</div>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <button type="button" onClick={onBack} style={{ flex: 1, background: '#fff', color: '#2A6B46', border: '2px solid #2A6B46', borderRadius: 16, padding: '14px 0', fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'all 0.15s' }}>
                    Back
                </button>
                <button type="submit" style={{ flex: 2, background: '#8DD256', color: '#fff', border: 'none', borderRadius: 16, padding: '14px 0', fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px rgba(141,210,86,0.15)', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}>
                    Generate Recommendations
                </button>
            </div>
        </form>
    );
} 