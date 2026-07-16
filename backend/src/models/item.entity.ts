import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Category } from './category.entity';
import { ItemIngredient } from './item-ingredients.entity';
import { Restaurant } from './restaurant.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  currentCost!: number | null;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  currentProfit!: number | null;

  @Column({ nullable: true })
  photoUrl!: string;

  @Column({default: 'private'})
  visibility!: 'public' | 'private'

  @ManyToOne(() => Category, (category) => category.items, { onDelete: 'CASCADE' })
  category!: Category;

  @ManyToOne(() => Restaurant, restaurant => restaurant.items, { onDelete: 'CASCADE' })
  restaurant!: Restaurant;

  @OneToMany(
    () => ItemIngredient,
    ingredient => ingredient.item,
    { cascade: true }
  )
  ingredients!: ItemIngredient[];
}