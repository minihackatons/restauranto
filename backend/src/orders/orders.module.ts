import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/models/order.entity';
import { OrderItem } from 'src/models/order-item.entity';
import { Item } from 'src/models/item.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { FinanceService } from 'src/finance/finance.service';
import { FinanceRecord } from 'src/models/finance-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Item, FinanceRecord])],
  providers: [OrdersService, FinanceService],
  controllers: [OrdersController],
})
export class OrdersModule {}
