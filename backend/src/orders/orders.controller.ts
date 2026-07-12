import { Controller, ForbiddenException, NotFoundException, Post, Get, Req, UseGuards, Body, Query, Param } from '@nestjs/common';
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
  async findAll(@Req() req: any, @Query('page') page, @Query('includeDelivered') includeDelivered) {
    if (!req.user.restaurantId){
      throw new ForbiddenException('Usuário não possui restaurante vinculado.');
    }
    return this.ordersService.findAll(req.user.restaurantId, Boolean(includeDelivered), Number(page));
  }

  @Get('dashboard')
  async getDashboardData(@Req() req: any, @Query('days-ago') daysAgo?: string) {
    if (!req.user.restaurantId){
      throw new ForbiddenException('Usuário não possui restaurante vinculado.');
    }
    const days = daysAgo ? parseInt(daysAgo, 10) : 7;
    return this.ordersService.getDashboardData(req.user.restaurantId, days);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    if (!req.user.restaurantId) {
      throw new ForbiddenException('Usuário não possui restaurante vinculado.');
    }
    const order = await this.ordersService.findOne(req.user.restaurantId, id);
    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }
    return order;
  }
}
