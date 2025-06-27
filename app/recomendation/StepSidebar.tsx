import React from "react";

interface StepSidebarProps {
  steps: string[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const StepSidebar: React.FC<StepSidebarProps> = ({ steps, currentStep, setCurrentStep }) => {
  return (
    <aside
      className="bg-background-secondary border-r border-border rounded-l-3xl p-12 flex flex-col items-start min-h-[700px] w-[260px]"
    >
      <h3 className="font-montserrat font-semibold text-2xl mb-10 text-brand-primary">Generate Recommendation</h3>
      <div className="relative w-full h-[180px] mb-0">
        {/* Animated vertical progress line */}
        <div className="absolute left-4 top-4 w-1 h-[148px] bg-border rounded z-0" />
        <div
          className="absolute left-4 top-4 w-1 rounded z-1 transition-all duration-400"
          style={{ height: `${(currentStep / (steps.length - 1)) * 148}px`, background: 'var(--current-brand-accent)' }}
        />
        <ol className="list-none p-0 m-0 w-full relative z-2">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            return (
              <li
                key={step}
                className={`flex items-center mb-12 last:mb-0 ${isCompleted ? 'cursor-pointer' : ''}`}
                onClick={() => isCompleted && setCurrentStep(idx)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg mr-4 transition-all ${isCompleted || isActive ? 'bg-brand-accent text-white border-2 border-brand-accent shadow' : 'bg-white text-text-primary border-2 border-border'}`}
                >
                  {isCompleted ? (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10" cy="10" r="10" fill="var(--current-brand-accent)" />
                      <path d="M6 10.5L9 13.5L14 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <div className={`font-lato text-base transition-colors ${isActive || isCompleted ? 'font-bold text-brand-primary' : 'text-text-secondary'}`}>{step}</div>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
};

export default StepSidebar; 