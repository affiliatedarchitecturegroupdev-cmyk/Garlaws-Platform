import { LearningDashboard } from '@/components/LearningDashboard';

interface PageProps {
  params: {
    userId: string;
  };
}

export default function AcademyDashboardPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <LearningDashboard userId={params.userId} />
    </div>
  );
}