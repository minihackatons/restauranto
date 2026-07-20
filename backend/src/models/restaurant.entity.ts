import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Category } from './category.entity';
import { Order } from './order.entity';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
import { Item } from './item.entity';
import { RestaurantStatistics } from './statistics.entity';

@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  document!: string;

  @Column()
  address!: string;

  @Column({ nullable: true })
  phone!: string;

  @OneToMany(() => Category, (category) => category.restaurant, { cascade: true })
  categories!: Category[];

  @OneToMany(() => Order, (order) => order.restaurant, { cascade: true })
  orders!: Order[];

  @OneToMany(() => User, (user) => user.restaurant)
  users!: User[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.restaurant, { cascade: true })
  orderItems!: OrderItem[];

  @OneToMany(() => Item, (item) => item.restaurant, { cascade: true })
  items!: Item[];

  @OneToMany(
    () => RestaurantStatistics,
    statistics => statistics.restaurant
  )
  statistics!: RestaurantStatistics[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}