import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FinanceRecord } from 'src/models/finance-record.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(FinanceRecord)
    private financeRepository: Repository<FinanceRecord>
  ){}
  async getOverview(restaurantId: string) {
    return await this.financeRepository.find({
      where: {
        restaurant: {
          id: restaurantId
        }
      },
      relations: {
        order: true
      }
    });
  }

  async registerOrder(restaurantId: string, orderId: string, value: number){
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

    return this.financeRepository.save(orderRecord);
  }

  async registerStock(restaurantId: string, stockItemName: string, value: number){
    const stockRecord = this.financeRepository.create({
      restaurant: {
        id: restaurantId
      },
      type: 'EXPENSE',
      category: 'STOCK',
      description: stockItemName,
      value: value
    })

    return this.financeRepository.save(stockRecord);
  }
}
