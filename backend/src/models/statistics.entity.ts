import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Restaurant } from "./restaurant.entity";


@Entity()
export class RestaurantStatistics {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Restaurant, r => r.id)
    restaurant!: Restaurant;

    @Column()
    clickType!: 'whatsapp' | 'menu' | 'site' | 'view';
}