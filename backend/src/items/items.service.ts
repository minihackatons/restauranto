import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindOptionsWhere } from 'typeorm';
import { Item } from '../models/item.entity';
import { Category } from '../models/category.entity';
import { ItemIngredient } from '../models/item-ingredients.entity';
import { StockItem } from '../models/stock-item.entity';
import { CreateItemDto, UpdateItemDto } from "../dtos/item.dto";

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
                        if (stockItem && stockItem.maxStock && Number(stockItem.maxStock) > 0) {
                            currentCost += ((Number(stockItem.cost) / Number(stockItem.maxStock)) * Number(ing.amount));
                        } else if (stockItem) {
                            // fallback case if maxStock is not set or 0
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
          currentProfit,
          restaurant: { id: restaurantId }
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

    async getItems(isOnlyPublic: boolean = true, restaurantId?: string, restaurantName?: string){
        const where: FindOptionsWhere<Item> = {};

        if (isOnlyPublic){
            where.visibility = 'public';
        }

        if (restaurantId){
            where.restaurant = { id: restaurantId };
        }

        if (restaurantName){
            where.restaurant = { name: restaurantName };
        }
        
        const items = await this.itemRepository.find({
            where,
            relations: {
                category: true,
                ingredients: { stockItem: true }
            }
        });

        return {data: items}
    }

    async updateItem(id: string, updateItemDto: UpdateItemDto, restaurantId: string, photoUrl?: string): Promise<Item> {
        const item = await this.itemRepository.findOne({ where: { id }, relations: { restaurant: true } });
        if (!item) {
            throw new NotFoundException('Item não encontrado.');
        }

        if (item.restaurant?.id !== restaurantId) {
            throw new ForbiddenException('Você não pode alterar um item de outro restaurante.');
        }

        const { categoryId, ingredients, ...itemData } = updateItemDto;

        if (categoryId) {
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
            item.category = category;
        }

        let parsedIngredients: any[] | null = null;
        let currentCost: number | null = item.currentCost;
        let currentProfit: number | null = item.currentProfit;

        if (ingredients !== undefined) {
            try {
                parsedIngredients = JSON.parse(ingredients);
                if (Array.isArray(parsedIngredients) && parsedIngredients.length > 0) {
                    currentCost = 0;
                    const stockIds = parsedIngredients.map(ing => ing.stockItemId);
                    const stockItems = await this.stockItemRepository.findBy({ id: In(stockIds) });
                    
                    for (const ing of parsedIngredients) {
                        const stockItem = stockItems.find(s => s.id === Number(ing.stockItemId));
                        if (stockItem && stockItem.maxStock && Number(stockItem.maxStock) > 0) {
                            currentCost += ((Number(stockItem.cost) / Number(stockItem.maxStock)) * Number(ing.amount));
                        } else if (stockItem) {
                            currentCost += (Number(stockItem.cost) * Number(ing.amount));
                        }
                    }
                    const newPrice = itemData.price !== undefined ? Number(itemData.price) : Number(item.price);
                    currentProfit = newPrice - currentCost;
                } else {
                    currentCost = null;
                    currentProfit = null;
                }
            } catch (err) {
                throw new BadRequestException('Formato de ingredientes inválido.');
            }
        } else if (itemData.price !== undefined && currentCost !== null) {
            currentProfit = Number(itemData.price) - currentCost;
        }

        Object.assign(item, itemData);
        if (photoUrl) {
            item.photoUrl = photoUrl;
        }
        item.currentCost = currentCost;
        item.currentProfit = currentProfit;

        const updatedItem = await this.itemRepository.save(item);

        if (parsedIngredients !== null) {
            await this.itemIngredientRepository.delete({ item: { id: updatedItem.id } });
            
            if (parsedIngredients.length > 0) {
                const ingredientEntities = parsedIngredients.map((ing: any) => {
                    return this.itemIngredientRepository.create({
                        item: { id: updatedItem.id },
                        stockItem: { id: ing.stockItemId },
                        amount: ing.amount
                    });
                });
                await this.itemIngredientRepository.save(ingredientEntities);
            }
        }

        return updatedItem;
    }


    async changeVisibility(ids: string[], restaurantId: string){
        return await this.itemRepository
            .createQueryBuilder()
            .update()
            .set({
                visibility: () => `
                CASE
                    WHEN visibility = 'public' THEN 'private'
                    ELSE 'public'
                END
                `,
            })
            .where("id IN (:...ids) AND restaurantId = :restaurantId", { ids, restaurantId })
            .execute();
    }
}