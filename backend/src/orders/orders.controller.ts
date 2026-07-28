import { Controller, ForbiddenException, NotFoundException, Post, Get, Req, Res, UseGuards, Body, Query, Param, Patch, StreamableFile, Header } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from 'src/dtos/order.dto';
import type { Response } from 'express';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  async createOrder(@Body() dto: CreateOrderDto, @Req() req: any) {
    if (!req.user.restaurantId) {
      throw new ForbiddenException('Usuário não possui restaurante vinculado.');
    }

    return this.ordersService.create(dto, req.user.restaurantId);
  }

  @Get()
  async findAll(@Req() req: any, @Query('page') page, @Query('includeDelivered') includeDelivered) {
    if (!req.user.restaurantId) {
      throw new ForbiddenException('Usuário não possui restaurante vinculado.');
    }

    const isIncludeDelivered = includeDelivered === 'true';

    return this.ordersService.findAll(req.user.restaurantId, isIncludeDelivered, Number(page));
  }

  @Get('dashboard')
  async getDashboardData(@Req() req: any, @Query('days-ago') daysAgo?: string) {
    if (!req.user.restaurantId) {
      throw new ForbiddenException('Usuário não possui restaurante vinculado.');
    }
    const days = daysAgo ? parseInt(daysAgo, 10) : 7;
    return this.ordersService.getDashboardData(req.user.restaurantId, days);
  }

  @Get('export/csv')
  async exportCsv(
    @Req() req: any,
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string
  ) {
    if (!req.user.restaurantId) {
      throw new ForbiddenException('Usuário não possui restaurante vinculado.');
    }

    const csvContent = await this.ordersService.exportCsv(req.user.restaurantId, { startDate, endDate, status });
    const dateStr = new Date().toISOString().split('T')[0];

    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pedidos-${dateStr}.csv"`,
    });
    res.end(csvContent);
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

  @Patch(':id/status')
  async updateOrderStatus(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    if (!req.user.restaurantId) {
      throw new ForbiddenException('Usuário não possui restaurante vinculado.');
    }
    return this.ordersService.updateStatus(req.user.restaurantId, id, dto);
  }

  @Post(':id/receipt')
  async generateReceipt(@Req() req: any, @Res() res: Response, @Param('id') id: string) {
    if (!req.user.restaurantId) {
      throw new ForbiddenException('Usuário não possui restaurante vinculado.');
    }
    const pngBuffer = await this.ordersService.generateReceipt(req.user.restaurantId, id);
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="recibo-${id.slice(0, 8)}.png"`,
      'Content-Length': pngBuffer.length,
    });
    res.end(pngBuffer);
  }
}
