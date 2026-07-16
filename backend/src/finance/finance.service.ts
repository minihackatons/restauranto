import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FinanceRecord } from 'src/models/finance-record.entity';
import { Repository, MoreThanOrEqual, EntityManager } from 'typeorm';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(FinanceRecord)
    private financeRepository: Repository<FinanceRecord>
  ) { }
  async getOverview(restaurantId: string) {
    return await this.financeRepository.find({
      where: {
        restaurant: {
          id: restaurantId
        }
      },
      relations: {
        order: true
      },
      order: {
        createdAt: 'ASC'
      }
    });
  }

  async getDashboardData(restaurantId: string, daysAgo: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const financeRecords = await this.financeRepository.find({
      where: {
        restaurant: { id: restaurantId },
        createdAt: MoreThanOrEqual(startDate),
      }
    });

    let revenue = 0;
    let profit = 0;
    for (const rec of financeRecords) {
      if (rec.type === 'INCOME') {
        revenue += Number(rec.value);
        profit += Number(rec.value);
      } else {
        profit -= Number(rec.value);
      }
    }

    return { revenue, profit };
  }

  async registerOrder(restaurantId: string, orderId: string, value: number, manager?: EntityManager) {
    const orderRecord = this.financeRepository.create({
      restaurant: {
        id: restaurantId
      },
      type: 'INCOME',
      category: 'ORDER',
      order: {
        id: orderId
      },
      value: value
    })

    if (manager) {
      return manager.getRepository(FinanceRecord).save(orderRecord);
    }
    return this.financeRepository.save(orderRecord);
  }

  async registerStock(restaurantId: string, stockItemName: string, value: number, manager?: EntityManager) {
    const stockRecord = this.financeRepository.create({
      restaurant: {
        id: restaurantId
      },
      type: 'EXPENSE',
      category: 'STOCK',
      description: stockItemName,
      value: value
    })

    if (manager) {
      return manager.getRepository(FinanceRecord).save(stockRecord);
    }

    return this.financeRepository.save(stockRecord);
  }

  async registerExpense(restaurantId: string, payload: { description: string; type?: 'INCOME' | 'EXPENSE'; value: number; createdAt?: string | Date }, manager?: EntityManager) {
    const expenseRecord = this.financeRepository.create({
      restaurant: {
        id: restaurantId
      },
      type: payload.type || 'EXPENSE',
      category: 'OTHER',
      description: payload.description,
      value: payload.value,
      ...(payload.createdAt && { createdAt: new Date(payload.createdAt) })
    });

    if (manager) {
      return manager.getRepository(FinanceRecord).save(expenseRecord);
    }
    return this.financeRepository.save(expenseRecord);
  }
}
