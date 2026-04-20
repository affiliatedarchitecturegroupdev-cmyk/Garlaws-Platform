'use client';

import { useState, useEffect, useCallback } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  target?: string; // CSS selector for highlighting
  placement?: 'top' | 'bottom' | 'left' | 'right';
  required: boolean;
  skippable: boolean;
  actions: {
    primary: string;
    secondary?: string;
  };
}

interface UserProgress {
  userId: string;
  completedSteps: string[];
  currentStep: string | null;
  startedAt: string;
  completedAt?: string;
  skippedSteps: string[];
  timeSpent: Record<string, number>; // stepId -> seconds
}

interface GuidedTour {
  id: string;
  name: string;
  description: string;
  targetAudience: 'new-users' | 'existing-users' | 'admins' | 'all';
  steps: OnboardingStep[];
  isActive: boolean;
  completionRate: number;
  createdAt: string;
}

interface UserOnboardingFlowsProps {
  tenantId?: string;
  userId?: string;
}

export default function UserOnboardingFlows({
  tenantId = 'default',
  userId = 'current-user'
}: UserOnboardingFlowsProps) {
  const [tours, setTours] = useState<GuidedTour[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [activeTour, setActiveTour] = useState<GuidedTour | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [tooltips, setTooltips] = useState<Array<{
    id: string;
    element: HTMLElement;
    content: React.ReactNode;
    placement: 'top' | 'bottom' | 'left' | 'right';
    visible: boolean;
  }>>([]);

  const fetchTours = useCallback(async () => {
    try {
      const response = await fetch(`/api/landing?action=onboarding-tours&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setTours(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tours:', error);
    }
  }, [tenantId]);

  const fetchUserProgress = useCallback(async () => {
    try {
      const response = await fetch(`/api/landing?action=user-progress&userId=${userId}&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setUserProgress(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user progress:', error);
    }
  }, [userId, tenantId]);

  useEffect(() => {
    fetchTours();
    fetchUserProgress();
  }, [fetchTours, fetchUserProgress]);

  const startTour = (tour: GuidedTour) => {
    setActiveTour(tour);
    setCurrentStepIndex(0);
    setShowTour(true);

    // Initialize user progress if not exists
    if (!userProgress) {
      const newProgress: UserProgress = {
        userId,
        completedSteps: [],
        currentStep: tour.steps[0].id,
        startedAt: new Date().toISOString(),
        skippedSteps: [],
        timeSpent: {}
      };
      setUserProgress(newProgress);
    } else {
      setUserProgress(prev => prev ? {
        ...prev,
        currentStep: tour.steps[0].id
      } : null);
    }
  };

  const nextStep = () => {
    if (!activeTour) return;

    const currentStep = activeTour.steps[currentStepIndex];
    const nextIndex = currentStepIndex + 1;

    // Record time spent on current step
    if (userProgress && currentStep) {
      const timeSpent = Date.now() - new Date(userProgress.startedAt).getTime();
      setUserProgress(prev => prev ? {
        ...prev,
        timeSpent: {
          ...prev.timeSpent,
          [currentStep.id]: (prev.timeSpent[currentStep.id] || 0) + timeSpent
        }
      } : null);
    }

    if (nextIndex < activeTour.steps.length) {
      setCurrentStepIndex(nextIndex);
      setUserProgress(prev => prev ? {
        ...prev,
        currentStep: activeTour.steps[nextIndex].id
      } : null);
    } else {
      completeTour();
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setUserProgress(prev => prev ? {
        ...prev,
        currentStep: activeTour?.steps[currentStepIndex - 1].id || null
      } : null);
    }
  };

  const skipStep = () => {
    if (!activeTour) return;

    const currentStep = activeTour.steps[currentStepIndex];
    setUserProgress(prev => prev ? {
      ...prev,
      skippedSteps: [...prev.skippedSteps, currentStep.id]
    } : null);

    nextStep();
  };

  const completeTour = () => {
    if (!activeTour || !userProgress) return;

    const completedSteps = activeTour.steps.map(step => step.id);
    setUserProgress(prev => prev ? {
      ...prev,
      completedSteps: [...new Set([...prev.completedSteps, ...completedSteps])],
      currentStep: null,
      completedAt: new Date().toISOString()
    } : null);

    setShowTour(false);
    setActiveTour(null);
    setCurrentStepIndex(0);
  };

  const showTooltip = (step: OnboardingStep) => {
    if (!step.target) return;

    const element = document.querySelector(step.target) as HTMLElement;
    if (!element) return;

    const tooltip = {
      id: step.id,
      element,
      content: (
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
          <p className="text-sm text-gray-700 mb-3">{step.description}</p>
          <div className="flex space-x-2">
            <button
              onClick={nextStep}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              {step.actions.primary}
            </button>
            {step.actions.secondary && (
              <button
                onClick={skipStep}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
              >
                {step.actions.secondary}
              </button>
            )}
          </div>
        </div>
      ),
      placement: step.placement || 'bottom',
      visible: true
    };

    setTooltips([tooltip]);

    // Highlight the target element
    element.classList.add('ring-4', 'ring-blue-500', 'ring-opacity-50');
  };

  const hideTooltip = () => {
    setTooltips([]);
    // Remove highlighting from all elements
    document.querySelectorAll('.ring-4.ring-blue-500').forEach(el => {
      el.classList.remove('ring-4', 'ring-blue-500', 'ring-opacity-50');
    });
  };

  const createTour = async (tourData: Partial<GuidedTour>) => {
    try {
      const response = await fetch('/api/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-onboarding-tour',
          tenantId,
          tour: {
            ...tourData,
            id: `tour_${Date.now()}`,
            isActive: true,
            completionRate: 0,
            createdAt: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setTours(prev => [...prev, data.data]);
      }
    } catch (error) {
      console.error('Failed to create tour:', error);
    }
  };

  // Sample tours
  const sampleTours: GuidedTour[] = [
    {
      id: 'welcome-tour',
      name: 'Welcome to Garlaws Platform',
      description: 'Get started with the essential features',
      targetAudience: 'new-users',
      isActive: true,
      completionRate: 0,
      createdAt: new Date().toISOString(),
      steps: [
        {
          id: 'welcome-1',
          title: 'Welcome to Garlaws!',
          description: 'This platform helps you manage your business processes efficiently.',
          content: <div>Welcome content</div>,
          placement: 'bottom',
          required: true,
          skippable: false,
          actions: { primary: 'Get Started' }
        },
        {
          id: 'welcome-2',
          title: 'Navigation',
          description: 'Use the sidebar to navigate between different modules.',
          content: <div>Navigation content</div>,
          target: '[data-tour="navigation"]',
          placement: 'right',
          required: true,
          skippable: false,
          actions: { primary: 'Next', secondary: 'Skip' }
        },
        {
          id: 'welcome-3',
          title: 'Dashboard',
          description: 'Your dashboard shows key metrics and recent activity.',
          content: <div>Dashboard content</div>,
          target: '[data-tour="dashboard"]',
          placement: 'bottom',
          required: false,
          skippable: true,
          actions: { primary: 'Next', secondary: 'Skip' }
        }
      ]
    },
    {
      id: 'advanced-features',
      name: 'Advanced Features Tour',
      description: 'Explore powerful features for power users',
      targetAudience: 'existing-users',
      isActive: true,
      completionRate: 0,
      createdAt: new Date().toISOString(),
      steps: [
        {
          id: 'advanced-1',
          title: 'Automation Engine',
          description: 'Set up automated workflows to streamline your processes.',
          content: <div>Automation content</div>,
          target: '[data-tour="automation"]',
          placement: 'top',
          required: false,
          skippable: true,
          actions: { primary: 'Learn More', secondary: 'Skip' }
        }
      ]
    }
  ];

  useEffect(() => {
    // Initialize with sample tours if none exist
    if (tours.length === 0) {
      setTours(sampleTours);
    }
  }, [tours.length]);

  // Auto-show welcome tour for new users
  useEffect(() => {
    if (userProgress && userProgress.completedSteps.length === 0) {
      const welcomeTour = tours.find(t => t.id === 'welcome-tour');
      if (welcomeTour) {
        // Delay to allow page to load
        setTimeout(() => startTour(welcomeTour), 2000);
      }
    }
  }, [userProgress, tours]);

  const getProgressPercentage = (tour: GuidedTour) => {
    if (!userProgress) return 0;
    const completedInTour = tour.steps.filter(step =>
      userProgress.completedSteps.includes(step.id)
    ).length;
    return Math.round((completedInTour / tour.steps.length) * 100);
  };

  const isStepCompleted = (stepId: string) => {
    return userProgress?.completedSteps.includes(stepId) || false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">User Onboarding Flows</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => createTour({
              name: 'Custom Tour',
              description: 'A custom onboarding tour',
              targetAudience: 'all',
              steps: []
            })}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Tour
          </button>
          <button
            onClick={fetchTours}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* User Progress Overview */}
      {userProgress && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {userProgress.completedSteps.length}
              </div>
              <div className="text-sm text-gray-600">Steps Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tours.filter(tour => getProgressPercentage(tour) === 100).length}
              </div>
              <div className="text-sm text-gray-600">Tours Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {userProgress.skippedSteps.length}
              </div>
              <div className="text-sm text-gray-600">Steps Skipped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(userProgress.timeSpent).reduce((a, b) => a + b, 0) / 1000 / 60 | 0}m
              </div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
          </div>
        </div>
      )}

      {/* Available Tours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tours.map((tour) => (
          <div
            key={tour.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{tour.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{tour.description}</p>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {tour.targetAudience.replace('-', ' ')}
                  </span>
                  <span className="text-xs text-gray-600">
                    {tour.steps.length} steps
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(tour)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600">
                  {getProgressPercentage(tour)}% complete
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => startTour(tour)}
                disabled={!tour.isActive}
                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {getProgressPercentage(tour) > 0 ? 'Continue Tour' : 'Start Tour'}
              </button>
              <button
                onClick={() => {/* Edit tour */}}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tour Modal */}
      {showTour && activeTour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {activeTour.name}
                </h3>
                <div className="text-sm text-gray-600 mt-1">
                  Step {currentStepIndex + 1} of {activeTour.steps.length}
                </div>
              </div>
              <button
                onClick={() => setShowTour(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {(() => {
                const currentStep = activeTour.steps[currentStepIndex];
                return (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {currentStep.title}
                      </h4>
                      <p className="text-gray-700 mb-4">
                        {currentStep.description}
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {currentStep.content}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={previousStep}
                          disabled={currentStepIndex === 0}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 transition-colors"
                        >
                          Previous
                        </button>
                        <button
                          onClick={skipStep}
                          disabled={!currentStep.skippable}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                        >
                          Skip
                        </button>
                      </div>

                      <button
                        onClick={nextStep}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        {currentStepIndex === activeTour.steps.length - 1
                          ? 'Complete Tour'
                          : currentStep.actions.primary
                        }
                      </button>
                    </div>

                    {/* Progress Indicator */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentStepIndex + 1) / activeTour.steps.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Tooltips */}
      {tooltips.map((tooltip) => (
        <div
          key={tooltip.id}
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.element.getBoundingClientRect().left + tooltip.element.offsetWidth / 2,
            top: tooltip.element.getBoundingClientRect().top - 10,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
            <div className="text-sm">
              {tooltip.content}
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 translate-y-px w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
            </div>
          </div>
        </div>
      ))}

      {/* Progressive Disclosure Example */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Progressive Disclosure</h3>
        <ProgressiveDisclosureExample />
      </div>

      {/* Contextual Help */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Contextual Help</h3>
        <ContextualHelpExample />
      </div>
    </div>
  );
}

// Progressive Disclosure Component
function ProgressiveDisclosureExample() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('basic')}
          className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium">Basic Settings</span>
          <svg
            className={`w-5 h-5 transition-transform ${expandedSections.has('basic') ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.has('basic') && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="pt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>Auto</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('advanced')}
          className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium">Advanced Settings</span>
          <svg
            className={`w-5 h-5 transition-transform ${expandedSections.has('advanced') ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.has('advanced') && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="pt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cache Size</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Debug Mode</label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                  <span className="ml-2 text-sm">Enable debug logging</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Contextual Help Component
function ContextualHelpExample() {
  const [showHelp, setShowHelp] = useState<Record<string, boolean>>({});

  const toggleHelp = (helpId: string) => {
    setShowHelp(prev => ({
      ...prev,
      [helpId]: !prev[helpId]
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <label className="block text-sm font-medium text-gray-700">Auto-sync Settings</label>
        <button
          onClick={() => toggleHelp('autosync')}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Help"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {showHelp.autosync && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Auto-sync Settings</h4>
              <div className="mt-2 text-sm text-blue-700">
                <p>Enable automatic synchronization of data between systems. This will:</p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Sync data every 15 minutes when online</li>
                  <li>Resolve conflicts using the latest timestamp</li>
                  <li>Notify you of any sync failures</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <label className="flex items-center">
        <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
        <span className="ml-2 text-sm">Enable auto-sync</span>
      </label>
    </div>
  );
}