import { Injectable } from '@nestjs/common';
import { FinanceRecord } from 'src/models/finance-record.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FinanceService {
  constructor(
    private financeRepository: Repository<FinanceRecord>
  ){}
  getOverview(restaurantId: string) {
    this.financeRepository.find()    
  }
}
