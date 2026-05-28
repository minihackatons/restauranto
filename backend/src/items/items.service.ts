import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../models/item.entity';
import { CreateItemDto } from "../dtos/item.dto";

@Injectable()
export class ItemsService {
    constructor(
        @InjectRepository(Item)
        private itemRepository: Repository<Item>
    ) {}

    async createItem(createItemDto: CreateItemDto, photoUrl?: string): Promise <Item>{
        const { categoryId, ...itemData } = createItemDto;

        const newItem = this.itemRepository.create({
          ...itemData,
          photoUrl,
          category: { id: categoryId },
        });

        return this.itemRepository.save(newItem);
    }

    async getItems(){
        return this.itemRepository.find();
    }
}