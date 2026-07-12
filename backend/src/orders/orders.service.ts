import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrderDto } from 'src/dtos/order.dto';
import { OrderItem } from 'src/models/order-item.entity';
import { Order } from 'src/models/order.entity';
import { Item } from 'src/models/item.entity';
import { In, Repository, MoreThanOrEqual, Not, FindOptionsWhere } from 'typeorm';
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

    async findAll(restaurantId: string, includeDelivered: boolean, page: number = 1, pageSize=30) {
        const where: FindOptionsWhere<Order> = {
            restaurant: {
                id: restaurantId,
            },
        };

        if (!includeDelivered) {
            where.status = Not('DELIVERED');
        }

        const [orders, total] = await this.orderRepository.findAndCount({
            where,
            relations: {
                items: {
                    item: true
                }
            },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * pageSize,
            take: pageSize
        })
        
        return {
            data: orders,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        };
    }

    async findOne(restaurantId: string, id: string) {
        return this.orderRepository.findOne({
            where: { id, restaurant: { id: restaurantId } },
            relations: {
                items: {
                    item: true
                }
            }
        });
    }

    async getDashboardData(restaurantId: string, daysAgo: number = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);

        const totalOrders = await this.orderRepository.count({
            where: {
                restaurant: { id: restaurantId },
                createdAt: MoreThanOrEqual(startDate),
            }
        });

        const urgentOrders = await this.orderRepository.find({
            where: { 
                restaurant: { id: restaurantId },
                status: Not('DELIVERED')
            },
            order: { deliveryDate: 'ASC' },
            take: 5,
            relations: {
                items: {
                    item: true
                }
            }
        });

        const orderItems = await this.orderItemRepository.find({
            where: {
                order: {
                    restaurant: { id: restaurantId },
                    createdAt: MoreThanOrEqual(startDate)
                }
            },
            relations: {
                item: true
            }
        });

        const itemsCount: Record<string, { name: string, count: number }> = {};
        for (const oi of orderItems) {
            if (!oi.item) continue;
            const name = oi.item.name;
            if (!itemsCount[name]) {
                itemsCount[name] = { name, count: 0 };
            }
            itemsCount[name].count += oi.quantity;
        }

        const topItems = Object.values(itemsCount)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            totalOrders,
            urgentOrders,
            topItems,
            funnel: {
                views: 1250, // mock
                clicks: 430, // mock
                orders: totalOrders // real
            }
        };
    }
}
