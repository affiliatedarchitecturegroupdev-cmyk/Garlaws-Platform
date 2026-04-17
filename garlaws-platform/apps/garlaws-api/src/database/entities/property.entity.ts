import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';

export enum PropertyType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  ESTATE = 'estate',
}

export enum PropertyStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  MAINTENANCE = 'maintenance',
  INACTIVE = 'inactive',
}

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  province: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  size: number;

  @Column({ type: 'enum', enum: PropertyType, default: PropertyType.RESIDENTIAL })
  type: PropertyType;

  @Column({ type: 'enum', enum: PropertyStatus, default: PropertyStatus.PENDING })
  status: PropertyStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  value: number;

  @Column({ nullable: true })
  ownerId: string;

  @ManyToOne(() => User, { nullable: true })
  owner: User;

  @Column({ nullable: true })
  managerId: string;

  @Column({ default: false })
  iotEnabled: boolean;

  @Column({ nullable: true })
  subscriptionTier: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}