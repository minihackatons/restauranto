import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import Roles from './roles';
import { Restaurant } from './restaurant.entity';
import { ItemIngredient } from './item-ingredients.entity';

@Entity()
export class StockItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  measureUnit!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  stockAmount!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  maxStock!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  cost!: number;

  @Column('date', { nullable: true })
  expirationDate?: string;

  @ManyToOne(() => Restaurant, restaurant => restaurant.id)
  restaurant!: Restaurant

  @OneToMany(
    () => ItemIngredient,
    ingredient => ingredient.stockItem
  )
  itemIngredients!: ItemIngredient[]
}