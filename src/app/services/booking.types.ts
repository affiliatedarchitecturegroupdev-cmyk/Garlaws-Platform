export interface ServiceBooking {
  id: string;
  serviceType: 'garden_cleaning' | 'paving' | 'tree_trimming' | 'irrigation' | 'landscaping';
  propertyId: string;
  propertyAddress: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'confirmed' | 'en_route' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
  crewId?: string;
  notes?: string;
}

export interface Crew {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation?: { lat: number; lng: number };
  rating: number;
}

export interface TrackingInfo {
  bookingId: string;
  crewId: string;
  crewName: string;
  estimatedArrival: string;
  currentLocation: { lat: number; lng: number };
  status: 'pending' | 'confirmed' | 'en_route' | 'on_site';
}

export const serviceTypes = [
  { id: 'garden_cleaning', name: 'Garden Cleaning', description: 'Full garden clean-up service', icon: '🌿', basePrice: 450 },
  { id: 'paving', name: 'Paving Repairs', description: 'Driveway and pathway repairs', icon: '🛣️', basePrice: 1200 },
  { id: 'tree_trimming', name: 'Tree Trimming', description: 'Professional tree pruning', icon: '🌳', basePrice: 350 },
  { id: 'irrigation', name: 'Irrigation Repair', description: 'Sprinkler and drip system repairs', icon: '💧', basePrice: 800 },
  { id: 'landscaping', name: 'Landscaping', description: 'Design and installation services', icon: '🎨', basePrice: 2500 },
];

export const crewMembers: Crew[] = [
  { id: 'crew_1', name: 'Team Alpha', status: 'available', rating: 4.9 },
  { id: 'crew_2', name: 'Team Beta', status: 'available', rating: 4.8 },
  { id: 'crew_3', name: 'Team Gamma', status: 'busy', rating: 4.7 },
];