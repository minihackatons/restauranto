import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrderDto } from 'src/dtos/order.dto';
import { OrderItem } from 'src/models/order-item.entity';
import { Order } from 'src/models/order.entity';
import { Item } from 'src/models/item.entity';
import { In, Repository } from 'typeorm';
import { FinanceService } from 'src/finance/finance.service';
@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(OrderItem)
        private orderItemRepository: Repository<OrderItem>,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(Item)
        private itemRepository: Repository<Item>,
        private readonly financeService: FinanceService
    ){}

    // TODO: REFATORAR ESTA BUXA
    async create(dto: CreateOrderDto, restaurantId: string){
        const itemIds = dto.items.map(item => item.itemId);

        const itemsFromDb = await this.itemRepository.find({
            where: {
                id: In(itemIds),
                category: { restaurant: { id: restaurantId } }
            }
        })


        if (itemsFromDb.length !== itemIds.length) {
            throw new BadRequestException('Um ou mais itens inválidos ou não pertencente ao restaurante.');
        }

        let totalAmount = 0;

        const orderItems = dto.items.map(item => {
            let orderItem = new OrderItem();
            const realItem = itemsFromDb.find(i => i.id == item.itemId);

            if(!realItem) throw new BadRequestException('Item not found');

            orderItem.item = realItem;
            orderItem.quantity = item.quantity;
            orderItem.unitPrice = realItem.price;

            totalAmount += orderItem.unitPrice * orderItem.quantity;

            return orderItem;
        })

        const order = this.orderRepository.create({
            restaurant: {id: restaurantId},
            items: orderItems,
            totalAmount: totalAmount - (dto.discount || 0),
            discount: dto.discount || 0,
            clientName: dto.clientName,
            clientContact: dto.clientContact,
            deliveryAddress: dto.deliveryAddress,
            paymentMethod: dto.paymentMethod,
            channel: dto.channel,
            deliveryDate: dto.deliveryDate,
        })

        const savedOrder = await this.orderRepository.save(order);
        this.financeService.registerOrder(restaurantId, savedOrder.id, savedOrder.totalAmount);
        
        return savedOrder;
    }

    async findAll(restaurantId: string) {
        return this.orderRepository.find({
            where: { restaurant: { id: restaurantId } },
            relations: {
                items: {
                    item: true
                }
            },
            order: { createdAt: 'DESC' }
        });
    }
}
