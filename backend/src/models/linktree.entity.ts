import { Optional } from "@nestjs/common";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Restaurant } from "./restaurant.entity";

@Entity()
export class LinktreeRecord {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Optional()
    @Column({nullable: true})
    site?: string;

    @Optional()
    @Column({nullable: true})
    whatsapp?: string;

    @Optional()
    @Column({nullable: true})
    menu?: string;

    @ManyToOne(() => Restaurant, restaurant => restaurant.id, {cascade: true})
    restaurant!: Restaurant
}