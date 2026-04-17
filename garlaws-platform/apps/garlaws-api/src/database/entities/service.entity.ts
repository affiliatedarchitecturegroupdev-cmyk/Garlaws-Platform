import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Property } from './property.entity';

export enum ServiceCategory {
  MAINTENANCE = 'maintenance',
  LANDSCAPING = 'landscaping',
  CONSTRUCTION = 'construction',
  DESIGN = 'design',
  IRRIGATION = 'irrigation',
  TREE_PRUNING = 'tree_pruning',
}

export enum ServiceStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  DISCONTINUED = 'discontinued',
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: ServiceCategory })
  category: ServiceCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ type: 'enum', enum: ServiceStatus, default: ServiceStatus.AVAILABLE })
  status: ServiceStatus;

  @Column({ nullable: true })
  duration: string;

  @Column({ default: false })
  requiresEquipment: boolean;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  pricingTiers: Record<string, number>;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}