import { LandscapeDesignDashboard } from '@/components/LandscapeDesignDashboard';

interface PageProps {
  params: {
    propertyId: string;
  };
}

export default function LandscapeDesignPage({ params }: PageProps) {
  return (
    <div className="h-screen">
      <LandscapeDesignDashboard propertyId={params.propertyId} />
    </div>
  );
}