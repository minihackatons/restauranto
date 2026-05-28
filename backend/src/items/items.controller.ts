import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CreateItemDto } from "src/dtos/item.dto";
import { ItemsService } from "./items.service";

import { ApiOperation, ApiConsumes } from "@nestjs/swagger";

import { AuthGuard } from '@nestjs/passport';

@Controller("/items")
export class ItemsController {
    constructor(private readonly itemsService: ItemsService){}

    @ApiOperation({ summary: 'Creates a new Item for the restaurant' })
    @ApiConsumes('multipart/form-data')
    @UseGuards(AuthGuard('jwt'))
    @Post()
    async createItem (@Body() body: CreateItemDto){
        return this.itemsService.createItem(body);
    }

    @ApiOperation({summary: 'Gets all Restaurant items'})
    @Get()
    @UseGuards(AuthGuard('jwt'))
    async getItems(){
        return this.itemsService.getItems();
    }
}