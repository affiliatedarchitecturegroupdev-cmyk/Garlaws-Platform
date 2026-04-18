import { IoTMonitoringDashboard } from '@/components/IoTMonitoringDashboard';

interface PageProps {
  params: {
    propertyId: string;
  };
}

export default function IoTMonitoringPage({ params }: PageProps) {
  return (
    <div className="h-screen">
      <IoTMonitoringDashboard propertyId={params.propertyId} />
    </div>
  );
}