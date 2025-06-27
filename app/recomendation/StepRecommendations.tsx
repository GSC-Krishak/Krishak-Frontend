import React from "react";

const demoRecommendations = [
    {
        crop: "Paddy (Rice)",
        tag: "Highly Recommended",
        tagColor: "#8DD256",
        yield: "45 Quintals/Acre",
        fertilizer: "Urea, DAP, MOP (120kg, 60kg, 80kg)",
        profit: "22%",
        tip: "Rotate with legumes to improve soil nitrogen.",
        cta: true,
    },
    {
        crop: "Wheat",
        tag: "Moderately Recommended",
        tagColor: "#2A6B46",
        yield: "38 Quintals/Acre",
        fertilizer: "Urea, DAP (100kg, 50kg)",
        profit: "18%",
        tip: "Use certified seeds for better yield.",
        cta: true,
    },
    {
        crop: "Maize",
        tag: "Consider",
        tagColor: "#EBF4E0",
        yield: "30 Quintals/Acre",
        fertilizer: "Urea, MOP (90kg, 40kg)",
        profit: "12%",
        tip: "Ensure proper irrigation during flowering stage.",
        cta: false,
    },
    {
        crop: "Sugarcane",
        tag: "Highly Recommended",
        tagColor: "#8DD256",
        yield: "60 Tons/Acre",
        fertilizer: "Urea, DAP, MOP (150kg, 70kg, 90kg)",
        profit: "25%",
        tip: "Apply organic manure for better soil health.",
        cta: true,
    },
    {
        crop: "Cotton",
        tag: "Consider",
        tagColor: "#EBF4E0",
        yield: "20 Quintals/Acre",
        fertilizer: "Urea, DAP (80kg, 40kg)",
        profit: "10%",
        tip: "Monitor for pest attacks regularly.",
        cta: false,
    },
];

export default function StepRecommendations({ recommendations = demoRecommendations, onBack }) {
    return (
        <div className="max-w-3xl mx-auto">
            <h4 className="font-montserrat font-semibold text-2xl mb-6 text-brand-primary">Your Personalized Farming Recommendations</h4>
            <div className="font-lato text-text-secondary text-base mb-8">Based on your inputs, here are the top recommendations for your farm. Select a card to view more details.</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mx-auto">
                {recommendations.map((rec, idx) => (
                    <div
                        key={idx}
                        className="bg-background-secondary rounded-2xl shadow-lg flex flex-col min-h-[240px] min-w-0 max-w-full break-words p-0 m-0 animate-fadeInUp border border-border"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                        <div className={`px-6 py-4 rounded-t-2xl flex items-center justify-between ${rec.tag === 'Consider' ? 'bg-background-primary' : 'bg-brand-accent'}`}>
                            <div className={`font-bold text-lg ${rec.tag === 'Consider' ? 'text-text-primary' : 'text-brand-primary'}`}>{rec.crop}</div>
                            <span className={`rounded-full px-4 py-1 text-sm font-semibold ${rec.tag === 'Consider' ? 'bg-background-primary text-text-primary border border-border' : 'bg-brand-accent text-brand-primary'}`}>{rec.tag}</span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col gap-2">
                            <div className="font-bold">Estimated Yield: <span className="font-normal text-brand-accent">{rec.yield}</span></div>
                            <div>Fertilizer: <span className="text-text-secondary">{rec.fertilizer}</span></div>
                            <div className="font-bold text-brand-primary flex items-center">Potential Profit Margin: {rec.profit} <span className="ml-2 text-profit">★</span></div>
                            <div className="text-sm text-brand-primary mt-2">Tip: {rec.tip}</div>
                            {rec.cta && <a href="#" className="text-brand-accent text-sm font-semibold mt-2 underline">View Detailed Guide</a>}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-10 flex justify-center">
                <button onClick={onBack} className="bg-background-primary text-brand-primary border-2 border-brand-primary rounded-2xl py-4 px-10 font-lato font-bold text-lg cursor-pointer transition-all hover:bg-brand-primary hover:text-background-primary">Start New Analysis</button>
            </div>
        </div>
    );
}

// Add fadeInUp animation keyframes
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}`;
document.head.appendChild(style); 