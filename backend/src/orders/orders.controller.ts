import { Controller, ForbiddenException, Post, Get, Req, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from 'src/dtos/order.dto';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDto, @Req() req: any){
    if (!req.user.restaurantId){
      throw new ForbiddenException('Usuário não possui restaurante vinculado.');
    }

    return this.ordersService.create(dto, req.user.restaurantId);
  }

  @Get()
  async findAll(@Req() req: any) {
    if (!req.user.restaurantId){
      throw new ForbiddenException('Usuário não possui restaurante vinculado.');
    }
    return this.ordersService.findAll(req.user.restaurantId);
  }
}
