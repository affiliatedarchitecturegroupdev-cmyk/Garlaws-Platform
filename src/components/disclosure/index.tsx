'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Check, AlertCircle, Info, X } from 'lucide-react';
import { AnimatedButton, Micro } from '@/components/animations';

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  variant?: 'default' | 'bordered' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = false,
  icon,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const variants = {
    default: 'bg-card border border-border rounded-lg',
    bordered: 'border border-border rounded-lg',
    ghost: 'bg-transparent',
  };

  const sizes = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg',
  };

  return (
    <div className={cn(variants[variant], className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between text-left transition-colors',
          'hover:bg-accent/50 rounded-md -m-1 p-1',
          sizes[size]
        )}
      >
        <div className="flex items-center space-x-3">
          <Micro animation="spin" className="transition-transform duration-200">
            {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </Micro>
          {icon && <span>{icon}</span>}
          <span className="font-medium">{title}</span>
        </div>
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="pt-2">
          {children}
        </div>
      </div>
    </div>
  );
};

// Accordion Component (multiple collapsible sections)
interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({
  items,
  type = 'single',
  defaultValue = [],
  className,
}) => {
  const [openItems, setOpenItems] = useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : []
  );

  const toggleItem = (itemId: string) => {
    if (type === 'single') {
      setOpenItems(openItems.includes(itemId) ? [] : [itemId]);
    } else {
      setOpenItems(openItems.includes(itemId)
        ? openItems.filter(id => id !== itemId)
        : [...openItems, itemId]
      );
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item) => (
        <CollapsibleSection
          key={item.id}
          title={item.title}
          icon={item.icon}
          defaultOpen={openItems.includes(item.id)}
          onToggle={() => toggleItem(item.id)}
          disabled={item.disabled}
        >
          {item.content}
        </CollapsibleSection>
      ))}
    </div>
  );
};

// Step/Wizard Component
interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  validation?: () => boolean | Promise<boolean>;
  optional?: boolean;
}

interface WizardProps {
  steps: WizardStep[];
  onComplete?: (data: any) => void;
  onCancel?: () => void;
  className?: string;
}

const Wizard: React.FC<WizardProps> = ({
  steps,
  onComplete,
  onCancel,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepData, setStepData] = useState<Record<string, any>>({});

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const validateCurrentStep = async (): Promise<boolean> => {
    if (currentStepData.validation) {
      return await currentStepData.validation();
    }
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    setCompletedSteps(prev => new Set([...prev, currentStep]));
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleStepClick = async (stepIndex: number) => {
    if (stepIndex > currentStep) {
      // Validate current step before allowing forward navigation
      const isValid = await validateCurrentStep();
      if (!isValid) return;
    }

    setCurrentStep(stepIndex);
  };

  const handleComplete = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    setCompletedSteps(prev => new Set([...prev, currentStep]));
    onComplete?.(stepData);
  };

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => handleStepClick(index)}
                disabled={index > currentStep && !completedSteps.has(index - 1)}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                  index === currentStep && 'border-primary bg-primary text-primary-foreground',
                  completedSteps.has(index) && 'border-green-500 bg-green-500 text-white',
                  index < currentStep && !completedSteps.has(index) && 'border-gray-300 text-gray-400',
                  index > currentStep && 'border-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                {completedSteps.has(index) ? (
                  <Check size={16} />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4 transition-colors',
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">
            {currentStepData.title}
          </h2>
          {currentStepData.description && (
            <p className="text-muted-foreground mt-1">
              {currentStepData.description}
            </p>
          )}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6 min-h-64">
        {currentStepData.content}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {!isFirstStep && (
            <AnimatedButton
              variant="outline"
              onClick={handlePrevious}
              animation="scale"
            >
              Previous
            </AnimatedButton>
          )}
        </div>

        <div className="flex space-x-3">
          {onCancel && (
            <AnimatedButton
              variant="ghost"
              onClick={onCancel}
              animation="scale"
            >
              Cancel
            </AnimatedButton>
          )}

          {!isLastStep ? (
            <AnimatedButton
              onClick={handleNext}
              animation="scale"
            >
              Next
            </AnimatedButton>
          ) : (
            <AnimatedButton
              onClick={handleComplete}
              animation="scale"
            >
              Complete
            </AnimatedButton>
          )}
        </div>
      </div>
    </div>
  );
};

// Expandable Content Component
interface ExpandableContentProps {
  children: React.ReactNode;
  preview?: React.ReactNode;
  maxHeight?: number;
  className?: string;
}

const ExpandableContent: React.FC<ExpandableContentProps> = ({
  children,
  preview,
  maxHeight = 200,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      setShowButton(contentHeight > maxHeight);
    }
  }, [children, maxHeight]);

  return (
    <div className={className}>
      <div
        ref={contentRef}
        className={cn(
          'transition-all duration-300 ease-in-out overflow-hidden',
          isExpanded ? 'max-h-none' : `max-h-${maxHeight}px`
        )}
      >
        {isExpanded ? children : (preview || children)}
      </div>

      {showButton && (
        <div className="mt-4 text-center">
          <AnimatedButton
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            animation="scale"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </AnimatedButton>
        </div>
      )}
    </div>
  );
};

// Progressive Loading Component
interface ProgressiveLoaderProps {
  steps: Array<{
    label: string;
    action: () => Promise<any>;
  }>;
  onComplete?: (results: any[]) => void;
  onError?: (error: Error, stepIndex: number) => void;
  className?: string;
}

const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  steps,
  onComplete,
  onError,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const executeStep = async (stepIndex: number) => {
    if (stepIndex >= steps.length) {
      onComplete?.(results);
      return;
    }

    setIsLoading(true);
    try {
      const result = await steps[stepIndex].action();
      setResults(prev => [...prev, result]);
      setCompletedSteps(prev => [...prev, stepIndex]);
      setCurrentStep(stepIndex + 1);

      // Auto-advance to next step
      setTimeout(() => executeStep(stepIndex + 1), 500);
    } catch (error) {
      onError?.(error as Error, stepIndex);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    executeStep(0);
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {steps.map((step, index) => (
        <div
          key={index}
          className={cn(
            'flex items-center space-x-3 p-4 rounded-lg border transition-all',
            completedSteps.includes(index) && 'border-green-200 bg-green-50',
            index === currentStep && isLoading && 'border-blue-200 bg-blue-50',
            index > currentStep && 'border-gray-200 bg-gray-50'
          )}
        >
          <div className="flex-shrink-0">
            {completedSteps.includes(index) ? (
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
            ) : index === currentStep && isLoading ? (
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-500 font-medium">
                  {index + 1}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <p className={cn(
              'text-sm font-medium',
              completedSteps.includes(index) && 'text-green-700',
              index === currentStep && isLoading && 'text-blue-700',
              index > currentStep && 'text-gray-500'
            )}>
              {step.label}
            </p>
          </div>

          {completedSteps.includes(index) && (
            <div className="flex-shrink-0">
              <span className="text-xs text-green-600 font-medium">✓</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Disclosure Panel Component
interface DisclosurePanelProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
  className?: string;
}

const DisclosurePanel: React.FC<DisclosurePanelProps> = ({
  trigger,
  children,
  defaultOpen = false,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={className}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between p-4 text-left border border-border rounded-lg',
          'hover:bg-accent/50 transition-colors',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {trigger}
        <Micro animation="spin" className="transition-transform duration-200">
          <ChevronDown
            size={20}
            className={cn(
              'transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </Micro>
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
        )}
      >
        <div className="p-4 border border-border rounded-lg bg-card">
          {children}
        </div>
      </div>
    </div>
  );
};

export {
  CollapsibleSection,
  Accordion,
  Wizard,
  ExpandableContent,
  ProgressiveLoader,
  DisclosurePanel,
};

export type {
  AccordionItem,
  WizardStep,
};