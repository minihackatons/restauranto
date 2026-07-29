import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrderDto, UpdateOrderStatusDto } from 'src/dtos/order.dto';
import { OrderItem } from 'src/models/order-item.entity';
import { Order } from 'src/models/order.entity';
import { Item } from 'src/models/item.entity';
import { StockItem } from 'src/models/stock-item.entity';
import { In, Repository, MoreThanOrEqual, LessThanOrEqual, Between, Not, FindOptionsWhere, DataSource } from 'typeorm';
import { FinanceService } from 'src/finance/finance.service';
import { BucketService } from 'src/shared/bucket.service';
import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';

export interface ExportCsvFilters {
    startDate?: string;
    endDate?: string;
    status?: string;
}

const CSV_COLUMNS = [
    'pedido_id',
    'status',
    'cliente',
    'contato_cliente',
    'endereco_entrega',
    'forma_pagamento',
    'canal',
    'desconto',
    'total_pedido',
    'data_criacao',
    'data_entrega',
    'item_nome',
    'item_quantidade',
    'item_preco_unitario',
    'item_subtotal',
];

function escapeCsvValue(val: unknown): string {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(';') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

let cachedFont: ArrayBuffer | null = null;
async function getFont() {
    if (cachedFont) return cachedFont;
    const res = await fetch('https://raw.githubusercontent.com/googlefonts/roboto/main/src/hinted/Roboto-Bold.ttf');
    cachedFont = await res.arrayBuffer();
    return cachedFont;
}

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(OrderItem)
        private orderItemRepository: Repository<OrderItem>,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(Item)
        private itemRepository: Repository<Item>,
        private readonly financeService: FinanceService,
        private dataSource: DataSource,
        private readonly bucketService: BucketService
    ) { }

    // TODO: REFATORAR ESTA BUXA
    async create(dto: CreateOrderDto, restaurantId: string) {
        const itemIds = dto.items.map(item => item.itemId);

        return this.dataSource.transaction(async (transactionalEntityManager) => {
            const itemsFromDb = await transactionalEntityManager.getRepository(Item).find({
                where: {
                    id: In(itemIds),
                    category: { restaurant: { id: restaurantId } }
                },
                relations: { ingredients: { stockItem: true } }
            });

            if (itemsFromDb.length !== itemIds.length) {
                throw new BadRequestException('Um ou mais itens inválidos ou não pertencente ao restaurante.');
            }

            let totalAmount = 0;

            const orderItems = dto.items.map(item => {
                let orderItem = new OrderItem();
                const realItem = itemsFromDb.find(i => i.id == item.itemId);

                if (!realItem) throw new BadRequestException('Item not found');

                orderItem.item = realItem;
                orderItem.quantity = item.quantity;
                orderItem.unitPrice = realItem.price;

                totalAmount += orderItem.unitPrice * orderItem.quantity;

                return orderItem;
            });

            const stockDeductions = new Map<number, { stockItem: StockItem, deduction: number }>();

            for (const orderItem of orderItems) {
                if (!orderItem.item.ingredients) continue;
                for (const ingredient of orderItem.item.ingredients) {
                    if (!ingredient.stockItem) continue;
                    const totalDeduction = ingredient.amount * orderItem.quantity;

                    const existingDeduction = stockDeductions.get(ingredient.stockItem.id);
                    if (existingDeduction) {
                        existingDeduction.deduction += totalDeduction;
                    } else {
                        stockDeductions.set(ingredient.stockItem.id, {
                            stockItem: ingredient.stockItem,
                            deduction: totalDeduction
                        });
                    }
                }
            }

            for (const [stockId, data] of stockDeductions.entries()) {
                const lockedStockItem = await transactionalEntityManager.findOne(StockItem, {
                    where: { id: stockId },
                    lock: { mode: 'pessimistic_write' }
                });

                if (!lockedStockItem) {
                    throw new BadRequestException(`INSUFFICIENT_STOCK: Estoque não encontrado para ${data.stockItem.name}.`);
                }

                const newAmount = Number(lockedStockItem.stockAmount) - data.deduction;

                if (newAmount < 0 && !dto.forceNegativeStock) {
                    throw new BadRequestException(`INSUFFICIENT_STOCK: Estoque insuficiente de ${lockedStockItem.name}.`);
                }
                lockedStockItem.stockAmount = newAmount;
                await transactionalEntityManager.save(lockedStockItem);
            }

            const order = transactionalEntityManager.create(Order, {
                restaurant: { id: restaurantId },
                items: orderItems,
                totalAmount: totalAmount - (dto.discount || 0),
                discount: dto.discount || 0,
                clientName: dto.clientName,
                clientContact: dto.clientContact,
                deliveryAddress: dto.deliveryAddress,
                paymentMethod: dto.paymentMethod,
                channel: dto.channel,
                deliveryDate: dto.deliveryDate,
            });

            const savedOrder = await transactionalEntityManager.save(order);

            await this.financeService.registerOrder(restaurantId, savedOrder.id, savedOrder.totalAmount, transactionalEntityManager);

            return savedOrder;
        });
    }

    async findAll(restaurantId: string, includeDelivered: boolean, page: number = 1, pageSize = 30) {
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
                restaurant: true,
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
            .slice(0, 3);

        return {
            totalOrders,
            urgentOrders,
            topItems,
            funnel: {
                views: 0,
                clicks: 0,
                orders: totalOrders
            }
        };
    }

    async updateStatus(restaurantId: string, id: string, dto: UpdateOrderStatusDto) {
        const allowedStatuses = new Set(['PENDING', 'PREPARING', 'READY', 'DELIVERED']);
        if (!allowedStatuses.has(dto.status)) {
            throw new BadRequestException('Status inválido');
        }
        const order = await this.findOne(restaurantId, id);
        if (!order) throw new NotFoundException('Pedido não encontrado');
        order.status = dto.status;
        return this.orderRepository.save(order);
    }

    async generateReceipt(restaurantId: string, id: string): Promise<Buffer> {
        const order = await this.findOne(restaurantId, id);

        if (!order) throw new NotFoundException('Pedido não encontrado');

        // Return cached receipt if already generated
        if (order.receiptUrl) {
            const cached = await fetch(order.receiptUrl);
            if (cached.ok) return Buffer.from(await cached.arrayBuffer());
        }

        const fontData = await getFont();

        const template = html(`
            <div style="display: flex; flex-direction: column; background-color: #FFFFFF; color: #3B2A1A; width: 400px; padding: 40px 30px; font-family: Roboto;">
                <div style="display: flex; justify-content: center; font-size: 36px; font-weight: bold; margin-bottom: 30px;">
                    ${order.restaurant.name}
                </div>

                <div style="display: flex; width: 100%; border-bottom: 1px solid #3B2A1A; padding-bottom: 8px; margin-bottom: 12px;">
                    <div style="display: flex; width: 20%; font-weight: bold; font-size: 16px;">QTD</div>
                    <div style="display: flex; width: 50%; font-weight: bold; font-size: 16px; justify-content: center;">ITEM</div>
                    <div style="display: flex; width: 30%; font-weight: bold; font-size: 16px; justify-content: flex-end;">PREÇO</div>
                </div>

                ${order.items.map(i => `
                <div style="display: flex; width: 100%; margin-bottom: 6px; font-size: 16px;">
                    <div style="display: flex; width: 20%;">${i.quantity}</div>
                    <div style="display: flex; width: 50%; justify-content: center; text-transform: uppercase;">${i.item.name}</div>
                    <div style="display: flex; width: 30%; justify-content: flex-end;">${Number(i.unitPrice * i.quantity).toFixed(0)}</div>
                </div>
                `).join('')}

                <div style="display: flex; width: 100%; border-top: 1px solid #3B2A1A; margin-top: 12px; padding-top: 12px; font-weight: bold; font-size: 18px;">
                    <div style="display: flex; width: 20;">TOTAL</div>
                    <div style="display: flex; flex-grow: 1; justify-content: flex-end;">R$ ${Number(order.totalAmount).toFixed(2).replace('.', ',')}</div>
                </div>

                <div style="display: flex; flex-direction: column; align-items: center; font-size: 12px; margin-top: 30px; color: #888;">
                    <span>Obrigado pela preferência!</span>
                </div>
            </div>
        `);

        const svg = await satori(template as any, {
            width: 400,
            fonts: [
                {
                    name: 'Roboto',
                    data: fontData,
                    weight: 400,
                    style: 'normal',
                }
            ],
        });

        const resvg = new Resvg(svg, {
            fitTo: { mode: 'width', value: 400 },
        });

        const pngData = resvg.render();
        const pngBuffer = Buffer.from(pngData.asPng());

        // Upload to S3 and cache the URL
        const receiptUrl = await this.bucketService.uploadImage({
            originalname: `receipt-${order.id}.png`,
            buffer: pngBuffer,
            mimetype: 'image/png'
        } as Express.Multer.File);

        order.receiptUrl = receiptUrl;
        await this.orderRepository.save(order);

        return pngBuffer;
    }

    async exportCsv(restaurantId: string, filters?: ExportCsvFilters): Promise<string> {
        const where: FindOptionsWhere<Order> = {
            restaurant: { id: restaurantId }
        };

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.startDate && filters?.endDate) {
            where.createdAt = Between(new Date(filters.startDate), new Date(filters.endDate));
        } else if (filters?.startDate) {
            where.createdAt = MoreThanOrEqual(new Date(filters.startDate));
        } else if (filters?.endDate) {
            where.createdAt = LessThanOrEqual(new Date(filters.endDate));
        }

        const orders = await this.orderRepository.find({
            where,
            relations: {
                items: {
                    item: true
                }
            },
            order: { createdAt: 'DESC' }
        });

        const BOM = '\uFEFF';
        let csvContent = BOM + CSV_COLUMNS.join(';') + '\n';

        for (const order of orders) {
            for (const orderItem of order.items) {
                const subtotal = orderItem.quantity * orderItem.unitPrice;
                const row = [
                    escapeCsvValue(order.id),
                    escapeCsvValue(order.status),
                    escapeCsvValue(order.clientName),
                    escapeCsvValue(order.clientContact),
                    escapeCsvValue(order.deliveryAddress),
                    escapeCsvValue(order.paymentMethod),
                    escapeCsvValue(order.channel),
                    escapeCsvValue(order.discount),
                    escapeCsvValue(order.totalAmount),
                    escapeCsvValue(order.createdAt.toISOString()),
                    escapeCsvValue(order.deliveryDate ? order.deliveryDate.toISOString() : ''),
                    escapeCsvValue(orderItem.item?.name),
                    escapeCsvValue(orderItem.quantity),
                    escapeCsvValue(orderItem.unitPrice),
                    escapeCsvValue(subtotal)
                ];
                csvContent += row.join(';') + '\n';
            }
        }

        return csvContent;
    }
}
