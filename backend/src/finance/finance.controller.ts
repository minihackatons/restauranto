import { Controller, Get, Post, Body, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FinanceService } from './finance.service';

@Controller('finance')
@UseGuards(AuthGuard('jwt'))
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get()
  getOverview(@Req() req: any) {
    if (!req.user.restaurantId) {
      throw new ForbiddenException('Usuário não possui restaurante vinculado.');
    }
    return this.financeService.getOverview(req.user.restaurantId);
  }

  @Post()
  async createTransaction(@Req() req: any, @Body() body: any) {
    if (!req.user.restaurantId) {
      throw new ForbiddenException('Usuário não possui restaurante vinculado.');
    }
    return this.financeService.registerExpense(req.user.restaurantId, body);
  }
}
