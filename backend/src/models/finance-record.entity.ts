import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IsDateString, IsOptional } from "class-validator";
import { Order } from "./order.entity";
import { Restaurant } from "./restaurant.entity";

@Entity()
export class FinanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  type!: 'INCOME' | 'EXPENSE';

  @Column()
  category!: 'ORDER' | 'STOCK' | 'OTHER';

  @Column({nullable: true})
  @IsOptional()
  description!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  value!: number;

  @Column({type: "timestamp", default: () => 'CURRENT_TIMESTAMP'})
  @IsDateString()
  createdAt?: Date;

  @Column({type: "timestamp", default: () => 'CURRENT_TIMESTAMP'})
  @IsDateString()
  updatedAt?: Date;

  @OneToOne(() => Order, { nullable: true })
  @JoinColumn()
  order?: Order;

  @ManyToOne(() => Restaurant)
  @JoinColumn()
  restaurant?: Restaurant
}