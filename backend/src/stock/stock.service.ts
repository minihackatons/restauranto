import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { StockItem } from "src/models/stock-item.entity";
import { Item } from "src/models/item.entity";
import { ItemIngredient } from "src/models/item-ingredients.entity";
import { Repository, DataSource } from "typeorm";
import { CreateStockItemDto, UpdateStockItemDto } from "src/dtos/stock-item.dto";
import { FinanceService } from "src/finance/finance.service";

@Injectable()
export class StockService {
    constructor(
        @InjectRepository(StockItem)
        private stockRepository: Repository<StockItem>,
        private financeService: FinanceService,
        private dataSource: DataSource
    ){}

    // TODO: make transactional
    async create(dto: CreateStockItemDto, restaurantId: string){

        return this.dataSource.transaction(async (manager)=>{
        const stockItem = manager.create(StockItem, {
            name: dto.name,
            measureUnit: dto.measureUnit,
            cost: dto.cost,
            stockAmount: dto.stockAmount,
            maxStock: dto.maxStock,
            expirationDate: dto.expirationDate,
            restaurant: { id: restaurantId }
        });

        const savedStockItem = await manager.save(stockItem)
        await this.financeService.registerStock(restaurantId, savedStockItem.name, savedStockItem.cost, manager);

        return savedStockItem;
    });
    }

    async findAll(restaurantId: string) {
        return await this.stockRepository.find({
            where: { restaurant: { id: restaurantId } }
        });
    }

    async findOne(id: number, restaurantId: string) {
        const item = await this.stockRepository.findOne({
            where: { id, restaurant: { id: restaurantId } }
        });

        if (!item) {
            throw new NotFoundException('Item de estoque não encontrado.');
        }

        return item;
    }
}