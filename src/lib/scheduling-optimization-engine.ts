// Advanced Scheduling Optimization Engine
export interface Technician {
  id: string;
  name: string;
  skills: string[]; // e.g., ['electrical', 'plumbing', 'hvac']
  location: {
    latitude: number;
    longitude: number;
    serviceArea: string;
  };
  availability: Array<{
    date: Date;
    startTime: string;
    endTime: string;
    available: boolean;
  }>;
  currentLoad: number; // 0-1 (percentage of capacity)
  rating: number;
  specialties: string[];
  certifications: string[];
  vehicle?: {
    type: string; // van, truck, car
    capacity: number; // equipment/tools capacity
  };
}

export interface ServiceBooking {
  id: string;
  customerId: string;
  serviceType: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  preferredDate?: Date;
  preferredTimeSlot?: 'morning' | 'afternoon' | 'evening';
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  estimatedDuration: number; // hours
  requiredSkills: string[];
  specialEquipment?: string[];
  customerPreferences: {
    preferredTechnician?: string;
    language?: string;
    accessibility?: boolean;
  };
}

export interface OptimizedSchedule {
  bookingId: string;
  assignedTechnician: string;
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  travelTime: number; // minutes
  totalDuration: number; // including travel
  confidence: number; // 0-1
  reasoning: string[];
  alternatives: Array<{
    technicianId: string;
    date: Date;
    startTime: string;
    score: number;
  }>;
}

export interface ScheduleOptimizationResult {
  optimizedSchedules: OptimizedSchedule[];
  efficiencyMetrics: {
    averageTravelTime: number;
    technicianUtilization: number;
    customerSatisfaction: number;
    costEfficiency: number;
  };
  conflicts: Array<{
    type: 'double_booking' | 'skill_mismatch' | 'travel_impossible';
    bookingId: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  recommendations: string[];
}

class SchedulingOptimizationEngine {
  private technicians: Map<string, Technician> = new Map();
  private bookings: ServiceBooking[] = [];

  // Initialize with mock data
  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock technicians
    this.technicians.set('TECH_001', {
      id: 'TECH_001',
      name: 'John Smith',
      skills: ['electrical', 'maintenance'],
      location: {
        latitude: -26.2041,
        longitude: 28.0473,
        serviceArea: 'Johannesburg CBD'
      },
      availability: this.generateAvailabilitySchedule(),
      currentLoad: 0.6,
      rating: 4.8,
      specialties: ['Smart Home Installation', 'Solar Panel Maintenance'],
      certifications: ['Licensed Electrician', 'Solar Certified'],
      vehicle: {
        type: 'van',
        capacity: 8
      }
    });

    this.technicians.set('TECH_002', {
      id: 'TECH_002',
      name: 'Sarah Johnson',
      skills: ['plumbing', 'hvac', 'maintenance'],
      location: {
        latitude: -26.1952,
        longitude: 28.0341,
        serviceArea: 'Sandton'
      },
      availability: this.generateAvailabilitySchedule(),
      currentLoad: 0.4,
      rating: 4.9,
      specialties: ['Emergency Repairs', 'System Optimization'],
      certifications: ['Master Plumber', 'HVAC Certified'],
      vehicle: {
        type: 'truck',
        capacity: 12
      }
    });

    this.technicians.set('TECH_003', {
      id: 'TECH_003',
      name: 'Mike Chen',
      skills: ['landscaping', 'pool_services', 'maintenance'],
      location: {
        latitude: -26.1852,
        longitude: 28.0241,
        serviceArea: 'Randburg'
      },
      availability: this.generateAvailabilitySchedule(),
      currentLoad: 0.7,
      rating: 4.7,
      specialties: ['Water Feature Design', 'Irrigation Systems'],
      certifications: ['Landscape Architect', 'Pool Maintenance Certified'],
      vehicle: {
        type: 'truck',
        capacity: 15
      }
    });
  }

  private generateAvailabilitySchedule(): Array<{ date: Date; startTime: string; endTime: string; available: boolean }> {
    const schedule = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) { // Next 2 weeks
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Skip weekends for some technicians
      if (date.getDay() === 0 || date.getDay() === 6) {
        if (Math.random() > 0.3) continue; // 70% chance of weekend availability
      }

      schedule.push({
        date: new Date(date),
        startTime: '08:00',
        endTime: '17:00',
        available: Math.random() > 0.2 // 80% availability
      });
    }

    return schedule;
  }

  // Main optimization function
  async optimizeSchedule(bookings: ServiceBooking[], optimizationCriteria: {
    prioritizeCustomerPreferences?: boolean;
    minimizeTravelTime?: boolean;
    balanceTechnicianLoad?: boolean;
    considerUrgency?: boolean;
  } = {}): Promise<ScheduleOptimizationResult> {
    this.bookings = bookings;
    const optimizedSchedules: OptimizedSchedule[] = [];
    const conflicts: Array<{
      type: 'double_booking' | 'skill_mismatch' | 'travel_impossible';
      bookingId: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
    }> = [];

    // Sort bookings by urgency and preferences
    const sortedBookings = this.sortBookingsByPriority(bookings, optimizationCriteria);

    for (const booking of sortedBookings) {
      const optimization = await this.findOptimalSchedule(booking, optimizationCriteria);

      if (optimization) {
        optimizedSchedules.push(optimization);

        // Update technician load
        const technician = this.technicians.get(optimization.assignedTechnician);
        if (technician) {
          technician.currentLoad += optimization.totalDuration / 8; // Assuming 8-hour workday
          technician.currentLoad = Math.min(technician.currentLoad, 1);
        }
      } else {
        conflicts.push({
          type: 'skill_mismatch',
          bookingId: booking.id,
          description: `No suitable technician available for ${booking.serviceType} service`,
          severity: booking.urgency === 'emergency' ? 'high' : 'medium'
        });
      }
    }

    // Calculate efficiency metrics
    const efficiencyMetrics = this.calculateEfficiencyMetrics(optimizedSchedules);

    // Generate recommendations
    const recommendations = this.generateOptimizationRecommendations(optimizedSchedules, conflicts);

    return {
      optimizedSchedules,
      efficiencyMetrics,
      conflicts,
      recommendations
    };
  }

  private sortBookingsByPriority(
    bookings: ServiceBooking[],
    criteria: any
  ): ServiceBooking[] {
    return bookings.sort((a, b) => {
      // Urgency first
      const urgencyOrder = { emergency: 4, high: 3, medium: 2, low: 1 };
      const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;

      // Customer preferences
      if (criteria.prioritizeCustomerPreferences) {
        const aHasPreference = !!a.customerPreferences.preferredTechnician;
        const bHasPreference = !!b.customerPreferences.preferredTechnician;
        if (aHasPreference && !bHasPreference) return -1;
        if (!aHasPreference && bHasPreference) return 1;
      }

      // Soonest preferred date
      if (a.preferredDate && b.preferredDate) {
        return a.preferredDate.getTime() - b.preferredDate.getTime();
      }

      return 0;
    });
  }

  private async findOptimalSchedule(
    booking: ServiceBooking,
    criteria: any
  ): Promise<OptimizedSchedule | null> {
    const candidates: Array<{
      technician: Technician;
      schedule: {
        date: Date;
        startTime: string;
        score: number;
      };
    }> = [];

    for (const [techId, technician] of this.technicians) {
      // Check skill match
      const skillMatch = this.calculateSkillMatch(technician, booking);
      if (skillMatch < 0.5) continue; // Minimum 50% skill match

      // Check availability
      const availableSlots = this.findAvailableSlots(technician, booking);

      for (const slot of availableSlots) {
        const travelTime = this.calculateTravelTime(technician.location, booking.location);
        const totalDuration = booking.estimatedDuration + (travelTime / 60); // Convert to hours

        // Check if technician can fit this booking
        if (technician.currentLoad + (totalDuration / 8) > 1) continue;

        const score = this.calculateScheduleScore(
          technician,
          booking,
          slot,
          travelTime,
          criteria
        );

        candidates.push({
          technician,
          schedule: {
            ...slot,
            score
          }
        });
      }
    }

    if (candidates.length === 0) return null;

    // Sort by score and select best
    candidates.sort((a, b) => b.schedule.score - a.schedule.score);
    const best = candidates[0];

    // Generate alternatives
    const alternatives = candidates.slice(1, 4).map(candidate => ({
      technicianId: candidate.technician.id,
      date: candidate.schedule.date,
      startTime: candidate.schedule.startTime,
      score: candidate.schedule.score
    }));

    const travelTime = this.calculateTravelTime(best.technician.location, booking.location);
    const totalDuration = booking.estimatedDuration + (travelTime / 60);

    return {
      bookingId: booking.id,
      assignedTechnician: best.technician.id,
      scheduledDate: best.schedule.date,
      startTime: best.schedule.startTime,
      endTime: this.addHours(best.schedule.startTime, booking.estimatedDuration),
      travelTime,
      totalDuration,
      confidence: best.schedule.score,
      reasoning: this.generateScheduleReasoning(best.technician, booking, best.schedule, criteria),
      alternatives
    };
  }

  private calculateSkillMatch(technician: Technician, booking: ServiceBooking): number {
    const requiredSkills = booking.requiredSkills;
    const technicianSkills = technician.skills;

    if (requiredSkills.length === 0) return 1;

    const matchedSkills = requiredSkills.filter(skill =>
      technicianSkills.some(techSkill =>
        techSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );

    return matchedSkills.length / requiredSkills.length;
  }

  private findAvailableSlots(technician: Technician, booking: ServiceBooking): Array<{
    date: Date;
    startTime: string;
    score: number;
  }> {
    const slots = [];

    for (const availability of technician.availability) {
      if (!availability.available) continue;

      // Check if preferred date/time matches
      let preferenceScore = 0.5; // Base score

      if (booking.preferredDate) {
        const dateMatch = availability.date.toDateString() === booking.preferredDate.toDateString();
        if (dateMatch) preferenceScore += 0.3;
      }

      if (booking.preferredTimeSlot) {
        const startHour = parseInt(availability.startTime.split(':')[0]);
        const timeSlot = startHour < 12 ? 'morning' :
                        startHour < 17 ? 'afternoon' : 'evening';
        if (timeSlot === booking.preferredTimeSlot) preferenceScore += 0.2;
      }

      // Check if slot can accommodate booking duration
      const availableHours = this.calculateAvailableHours(availability.startTime, availability.endTime);
      if (availableHours >= booking.estimatedDuration) {
        slots.push({
          date: availability.date,
          startTime: availability.startTime,
          score: preferenceScore
        });
      }
    }

    return slots;
  }

  private calculateScheduleScore(
    technician: Technician,
    booking: ServiceBooking,
    slot: any,
    travelTime: number,
    criteria: any
  ): number {
    let score = 0.5; // Base score

    // Skill match (30%)
    const skillMatch = this.calculateSkillMatch(technician, booking);
    score += skillMatch * 0.3;

    // Technician rating (20%)
    score += (technician.rating / 5) * 0.2;

    // Travel time optimization (if enabled)
    if (criteria.minimizeTravelTime) {
      const travelPenalty = Math.min(travelTime / 60, 1); // Max 1 hour penalty
      score += (1 - travelPenalty) * 0.15;
    }

    // Load balancing (if enabled)
    if (criteria.balanceTechnicianLoad) {
      const loadPenalty = technician.currentLoad;
      score += (1 - loadPenalty) * 0.15;
    }

    // Customer preferences (if enabled)
    if (criteria.prioritizeCustomerPreferences && booking.customerPreferences.preferredTechnician === technician.id) {
      score += 0.2;
    }

    // Urgency consideration
    const urgencyBonus = { emergency: 0.2, high: 0.15, medium: 0.1, low: 0.05 };
    score += urgencyBonus[booking.urgency];

    return Math.min(score, 1);
  }

  private calculateTravelTime(from: any, to: any): number {
    // Simplified travel time calculation (normally would use Google Maps API)
    const distance = this.calculateDistance(from, to);
    const averageSpeed = 40; // km/h in city traffic
    const baseTime = (distance / averageSpeed) * 60; // minutes

    // Add buffer for city traffic and parking
    return Math.round(baseTime + 15);
  }

  private calculateDistance(from: any, to: any): number {
    const R = 6371; // Earth's radius in km
    const dLat = (to.latitude - from.latitude) * Math.PI / 180;
    const dLon = (to.longitude - from.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(from.latitude * Math.PI / 180) * Math.cos(to.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private calculateAvailableHours(startTime: string, endTime: string): number {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  private addHours(time: string, hours: number): string {
    const date = new Date(`1970-01-01T${time}:00`);
    date.setHours(date.getHours() + hours);
    return date.toTimeString().slice(0, 5);
  }

  private generateScheduleReasoning(technician: Technician, booking: ServiceBooking, schedule: any, criteria: any): string[] {
    const reasoning = [];

    reasoning.push(`${technician.name} has the required skills for ${booking.serviceType}`);

    if (booking.customerPreferences.preferredTechnician === technician.id) {
      reasoning.push('Matches customer\'s preferred technician');
    }

    if (booking.preferredDate && schedule.date.toDateString() === booking.preferredDate.toDateString()) {
      reasoning.push('Matches customer\'s preferred date');
    }

    reasoning.push(`High rating: ${technician.rating}/5 from previous customers`);

    if (technician.specialties.length > 0) {
      reasoning.push(`Specializes in: ${technician.specialties.join(', ')}`);
    }

    return reasoning;
  }

  private calculateEfficiencyMetrics(schedules: OptimizedSchedule[]): ScheduleOptimizationResult['efficiencyMetrics'] {
    if (schedules.length === 0) {
      return {
        averageTravelTime: 0,
        technicianUtilization: 0,
        customerSatisfaction: 0,
        costEfficiency: 0
      };
    }

    const avgTravelTime = schedules.reduce((sum, s) => sum + s.travelTime, 0) / schedules.length;
    const technicianIds = [...new Set(schedules.map(s => s.assignedTechnician))];
    const avgUtilization = technicianIds.reduce((sum, id) => {
      const tech = this.technicians.get(id);
      return sum + (tech ? tech.currentLoad : 0);
    }, 0) / technicianIds.length;

    // Simplified calculations
    return {
      averageTravelTime: Math.round(avgTravelTime),
      technicianUtilization: Math.round(avgUtilization * 100),
      customerSatisfaction: 85, // Mock value
      costEfficiency: 78 // Mock value
    };
  }

  private generateOptimizationRecommendations(
    schedules: OptimizedSchedule[],
    conflicts: any[]
  ): string[] {
    const recommendations = [];

    if (conflicts.length > 0) {
      recommendations.push(`Address ${conflicts.length} scheduling conflicts`);
    }

    const avgTravelTime = schedules.reduce((sum, s) => sum + s.travelTime, 0) / schedules.length;
    if (avgTravelTime > 45) {
      recommendations.push('Consider hiring additional technicians to reduce travel time');
    }

    const highUtilizationTechs = Array.from(this.technicians.values()).filter(t => t.currentLoad > 0.8);
    if (highUtilizationTechs.length > 0) {
      recommendations.push(`Rebalance workload - ${highUtilizationTechs.length} technicians at high capacity`);
    }

    recommendations.push('Schedule regular maintenance during off-peak hours');
    recommendations.push('Implement predictive scheduling based on historical patterns');

    return recommendations;
  }
}

export const schedulingOptimizationEngine = new SchedulingOptimizationEngine();