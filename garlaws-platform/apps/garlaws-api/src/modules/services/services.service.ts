import { Injectable } from '@nestjs/common';

export interface Service {
  id: number;
  name: string;
  category: 'maintenance' | 'landscaping' | 'construction' | 'design';
  price: number;
  description: string;
}

@Injectable()
export class ServicesService {
  private services: Service[] = [
    { id: 1, name: 'Garden Maintenance', category: 'maintenance', price: 2500, description: 'Regular garden upkeep and landscaping' },
    { id: 2, name: 'Lawn Installation', category: 'landscaping', price: 15000, description: 'Professional lawn installation with indigenous plants' },
    { id: 3, name: 'Paving Repairs', category: 'construction', price: 5000, description: 'Driveway and pathway repair services' },
    { id: 4, name: 'Landscape Design', category: 'design', price: 25000, description: 'Custom landscape design consultation' },
    { id: 5, name: 'Tree Pruning', category: 'maintenance', price: 1500, description: 'Professional tree trimming and pruning' },
    { id: 6, name: 'Irrigation Install', category: 'landscaping', price: 12000, description: 'Smart irrigation system installation' },
  ];

  findAll(): Service[] {
    return this.services;
  }

  findByCategory(category: string): Service[] {
    return this.services.filter(s => s.category === category);
  }
}