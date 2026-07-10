import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Restaurant } from './restaurant.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: 'PENDING' })
  status!: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalAmount!: number;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders, { onDelete: 'CASCADE' })
  restaurant!: Restaurant;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items!: OrderItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  clientName!: string;

  @Column({ nullable: true })
  clientContact!: string;

  @Column({ nullable: true })
  deliveryAddress!: string;

  @Column({ nullable: true })
  paymentMethod!: string;

  @Column({ nullable: true })
  channel!: string;

  @Column({ type: 'timestamp', nullable: true })
  deliveryDate!: Date;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discount!: number;
}