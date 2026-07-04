import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { IsDateString } from "class-validator";
import { Order } from "./order.entity";

@Entity()
export class FinanceRecord {
  @Column()
  type!: number;

  @Column()
  description!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  value!: number;

  @Column("timestamp")
  @IsDateString()
  date?: Date;

  @OneToOne(() => Order, { nullable: true })
  @JoinColumn()
  order?: Order;
}