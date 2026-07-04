import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/models/order.entity';
import { OrderItem } from 'src/models/order-item.entity';
import { Item } from 'src/models/item.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Item])],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
