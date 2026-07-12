import { Controller, Get, Post, Body, Req, UseGuards, ForbiddenException, Query } from '@nestjs/common';
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

  @Get('dashboard')
  async getDashboardData(@Req() req: any, @Query('days-ago') daysAgo?: string) {
    if (!req.user.restaurantId) {
      throw new ForbiddenException('Usuário não possui restaurante vinculado.');
    }
    const days = daysAgo ? parseInt(daysAgo, 10) : 7;
    return this.financeService.getDashboardData(req.user.restaurantId, days);
  }

  @Post()
  async createTransaction(@Req() req: any, @Body() body: any) {
    if (!req.user.restaurantId) {
      throw new ForbiddenException('Usuário não possui restaurante vinculado.');
    }
    return this.financeService.registerExpense(req.user.restaurantId, body);
  }
}
