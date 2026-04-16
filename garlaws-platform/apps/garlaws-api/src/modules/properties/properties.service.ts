import { Injectable } from '@nestjs/common';

export interface Property {
  id: number;
  name: string;
  address: string;
  type: 'residential' | 'commercial' | 'industrial';
  status: 'active' | 'pending' | 'maintenance';
  value: number;
}

@Injectable()
export class PropertiesService {
  private properties: Property[] = [
    { id: 1, name: 'Ballito Hills Estate', address: 'Ballito, KZN', type: 'residential', status: 'active', value: 15000000 },
    { id: 2, name: 'Tinley Manor Complex', address: 'Tinley Manor, KZN', type: 'residential', status: 'active', value: 8500000 },
    { id: 3, name: 'Pinetown Warehouse', address: 'Pinetown, KZN', type: 'industrial', status: 'active', value: 12000000 },
    { id: 4, name: 'Umhlanga Business Park', address: 'Umhlanga, KZN', type: 'commercial', status: 'pending', value: 22000000 },
  ];

  findAll(): Property[] {
    return this.properties;
  }

  findOne(id: number): Property | undefined {
    return this.properties.find(p => p.id === id);
  }
}