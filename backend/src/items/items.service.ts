import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Item } from '../models/item.entity';
import { Category } from '../models/category.entity';
import { ItemIngredient } from '../models/item-ingredients.entity';
import { StockItem } from '../models/stock-item.entity';
import { CreateItemDto } from "../dtos/item.dto";

@Injectable()
export class ItemsService {
    constructor(
        @InjectRepository(Item)
        private itemRepository: Repository<Item>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        @InjectRepository(ItemIngredient)
        private itemIngredientRepository: Repository<ItemIngredient>,
        @InjectRepository(StockItem)
        private stockItemRepository: Repository<StockItem>
    ) {}

    // TODO: REFATORAR ESTA BUXA
    async createItem(createItemDto: CreateItemDto, restaurantId: string, photoUrl?: string): Promise <Item>{
        const { categoryId, ingredients, ...itemData } = createItemDto;

        const category = await this.categoryRepository.findOne({
            where: { id: categoryId },
            relations: { restaurant: true }
        });

        if (!category) {
            throw new NotFoundException('Categoria não encontrada.');
        }

        if (category.restaurant?.id !== restaurantId) {
            throw new ForbiddenException('Você não pode adicionar um item a uma categoria de outro restaurante.');
        }

        let currentCost: number | null = null;
        let currentProfit: number | null = null;
        let parsedIngredients: any[] = [];

        if (ingredients) {
            try {
                parsedIngredients = JSON.parse(ingredients);
                if (Array.isArray(parsedIngredients) && parsedIngredients.length > 0) {
                    currentCost = 0;
                    const stockIds = parsedIngredients.map(ing => ing.stockItemId);
                    const stockItems = await this.stockItemRepository.findBy({ id: In(stockIds) });
                    
                    for (const ing of parsedIngredients) {
                        const stockItem = stockItems.find(s => s.id === Number(ing.stockItemId));
                        if (stockItem && stockItem.stockAmount) {
                            currentCost += (Number(stockItem.cost) * Number(ing.amount));
                        }
                    }
                    currentProfit = Number(itemData.price) - currentCost;
                }
            } catch (err) {
                throw new BadRequestException('Formato de ingredientes inválido.');
            }
        }

        const newItem = this.itemRepository.create({
          ...itemData,
          photoUrl,
          category: { id: categoryId },
          currentCost,
          currentProfit
        });

        const savedItem = await this.itemRepository.save(newItem);

        if (parsedIngredients.length > 0) {
            const ingredientEntities = parsedIngredients.map((ing: any) => {
                return this.itemIngredientRepository.create({
                    item: { id: savedItem.id },
                    stockItem: { id: ing.stockItemId },
                    amount: ing.amount
                });
            });
            await this.itemIngredientRepository.save(ingredientEntities);
        }

        return savedItem;
    }

    async getItems(){
        const items = await this.itemRepository.find({
            relations: {
                category: true
            }
        });

        return {data: items}
    }
}