import { Module } from "@nestjs/common";
import { StockController } from "./stock.controller";
import { StockService } from "./stock.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StockItem } from "src/models/stock-item.entity";
import { Item } from "src/models/item.entity";
import { ItemIngredient } from "src/models/item-ingredients.entity";
import { FinanceService } from "src/finance/finance.service";
import { FinanceRecord } from "src/models/finance-record.entity";

@Module({
    imports: [TypeOrmModule.forFeature([StockItem, Item, ItemIngredient, FinanceRecord])],
    controllers: [StockController],
    providers: [StockService, FinanceService]
})
export class StockModule {}