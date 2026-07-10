import { Controller, Get, Post, Patch, Body, Req, ForbiddenException, Param, UseGuards } from "@nestjs/common";
import { StockService } from "./stock.service";
import { CreateStockItemDto, UpdateStockItemDto } from "src/dtos/stock-item.dto";
import { AuthGuard } from '@nestjs/passport';

@Controller('stock')
@UseGuards(AuthGuard('jwt'))
export class StockController {
    constructor(
        private readonly stockService: StockService
    ){}

    @Post()
    async createStockItem(
        @Body() body: CreateStockItemDto,
        @Req() req: any,
    ){
        if (!req.user.restaurantId) {
            throw new ForbiddenException('Usuário não possui restaurante vinculado.');
        }

        return this.stockService.create(body, req.user.restaurantId)
    }

    @Get()
    async getStockItems(
        @Req() req: any,
    ){
        if (!req.user.restaurantId) {
            throw new ForbiddenException('Usuário não possui restaurante vinculado.');
        }

        return this.stockService.findAll(req.user.restaurantId);
    }

    @Get(':id')
    async getStockItem(
        @Param('id') id: string,
        @Req() req: any,
    ){
        if (!req.user.restaurantId) {
            throw new ForbiddenException('Usuário não possui restaurante vinculado.');
        }

        return this.stockService.findOne(+id, req.user.restaurantId);
    }
}