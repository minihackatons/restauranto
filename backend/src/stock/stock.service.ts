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
            ...(dto.alertThreshold !== undefined ? { alertThreshold: dto.alertThreshold } : {}),
            ...(dto.alertDaysBefore !== undefined ? { alertDaysBefore: dto.alertDaysBefore } : {}),
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

    async getAlerts(restaurantId: string) {
        const items = await this.stockRepository.find({
            where: { restaurant: { id: restaurantId } }
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lowStock: Array<{
            id: number;
            name: string;
            stockAmount: number;
            maxStock: number;
            measureUnit: string;
            percentage: number;
        }> = [];

        const expiringSoon: Array<{
            id: number;
            name: string;
            expirationDate: string;
            daysUntilExpiry: number;
        }> = [];

        for (const item of items) {
            const stockAmount = Number(item.stockAmount);
            const maxStock = Number(item.maxStock);

            const alertThresholdPercent = item.alertThreshold !== undefined && item.alertThreshold !== null ? Number(item.alertThreshold) : 20;
            const thresholdRatio = alertThresholdPercent / 100;

            if (maxStock > 0 && stockAmount <= maxStock * thresholdRatio) {
                const percentage = Math.round((stockAmount / maxStock) * 100);
                lowStock.push({
                    id: item.id,
                    name: item.name,
                    stockAmount,
                    maxStock,
                    measureUnit: item.measureUnit,
                    percentage,
                });
            }

            if (item.expirationDate) {
                const expDate = new Date(item.expirationDate);
                expDate.setHours(0, 0, 0, 0);

                const diffTime = expDate.getTime() - today.getTime();
                const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                const alertDaysBefore = item.alertDaysBefore !== undefined && item.alertDaysBefore !== null ? Number(item.alertDaysBefore) : 7;

                if (daysUntilExpiry <= alertDaysBefore) {
                    expiringSoon.push({
                        id: item.id,
                        name: item.name,
                        expirationDate: String(item.expirationDate),
                        daysUntilExpiry,
                    });
                }
            }
        }

        return {
            lowStock,
            expiringSoon,
            totalAlerts: lowStock.length + expiringSoon.length,
        };
    }
}