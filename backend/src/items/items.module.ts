import { Module } from "@nestjs/common";
import { ItemsController } from "./items.controller";
import { ItemsService } from "./items.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Item } from "src/models/item.entity";
import { Category } from "src/models/category.entity";
import { ItemIngredient } from "src/models/item-ingredients.entity";
import { StockItem } from "src/models/stock-item.entity";
import { BucketService } from "src/shared/bucket.service";

@Module({
    imports: [TypeOrmModule.forFeature([Item, Category, ItemIngredient, StockItem])],
    controllers: [ItemsController],
    providers: [ItemsService, BucketService]
})
export class ItemsModule {}