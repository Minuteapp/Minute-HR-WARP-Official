
import React from 'react';

interface Step {
  id: string;
  title: string;
  component: React.FC<any>;
}

interface AssistantProgressProps {
  steps: Step[];
  currentStep: number;
}

const AssistantProgress: React.FC<AssistantProgressProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${index < currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : index === currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }
              `}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span className={`
                text-xs mt-1 text-center hidden sm:block
                ${index <= currentStep ? 'text-primary font-medium' : 'text-muted-foreground'}
              `}>
                {step.title}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`
                flex-1 h-[2px] mx-1
                ${index < currentStep ? 'bg-primary' : 'bg-muted'}
              `} />
            )}
          </React.Fragment>
        ))}
      </div>
      
      <div className="sm:hidden text-center text-sm font-medium mt-2">
        Schritt {currentStep + 1}: {steps[currentStep].title}
      </div>
    </div>
  );
};

export default AssistantProgress;
