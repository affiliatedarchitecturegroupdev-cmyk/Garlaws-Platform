'use client';

import ProfessionalNavigation from '@/features/landing/phase57/ProfessionalNavigation';
import EnterpriseHeroSection from '@/features/landing/phase57/EnterpriseHeroSection';
import ServiceOrchestrationLayer from '@/features/landing/phase57/ServiceOrchestrationLayer';
import ProfessionalFooter from '@/features/landing/phase57/ProfessionalFooter';
import UserOnboardingFlows from '@/features/landing/onboarding/UserOnboardingFlows';
import AccessibilityImprovements from '@/features/landing/accessibility/AccessibilityImprovements';
import LandingPageAnalytics from '@/features/landing/analytics/LandingPageAnalytics';

export default function ProfessionalLandingPage() {
  return (
    <div className="min-h-screen">
      <ProfessionalNavigation />
      <EnterpriseHeroSection />
      <ServiceOrchestrationLayer />
      <ProfessionalFooter />

      {/* Onboarding and Analytics */}
      <UserOnboardingFlows />
      <LandingPageAnalytics />
    </div>
  );
}