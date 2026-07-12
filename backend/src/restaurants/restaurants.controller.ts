import { Body, Controller, Post, Get, Patch, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto, LinktreeDto } from '../dtos/restaurant.dto';
import { UpdateRestaurantDto } from '../dtos/update-restaurant.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @ApiOperation({ summary: 'Create a new Restaurant and assign to user' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createRestaurant(@Body() body: CreateRestaurantDto, @Req() req: any) {
    return this.restaurantsService.createRestaurant(body, req.user.id);
  }

  @ApiOperation({ summary: 'Get current user restaurant' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getMyRestaurant(@Req() req: any) {
    return this.restaurantsService.getMyRestaurant(req.user.restaurantId);
  }

  @ApiOperation({ summary: 'Update current user restaurant' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch()
  async updateMyRestaurant(@Body() body: UpdateRestaurantDto, @Req() req: any) {
    return this.restaurantsService.updateMyRestaurant(req.user.restaurantId, body);
  }
  @Get('links')
  @UseGuards(AuthGuard('jwt'))
  async getLinktree(@Req() req: any){
    if (!req.user.restaurantId){
      throw new ForbiddenException('Usuário não associado a um restaurante. Faça login novamente.')
    }
    return this.restaurantsService.getLinktreeRecord(req.user.restaurantId);
  }
  
  @Patch('links')
  @UseGuards(AuthGuard('jwt'))
  async updateLinktree(@Body() body: LinktreeDto, @Req() req: any){
    if (!req.user.restaurantId){
      throw new ForbiddenException('Usuário não associado a um restaurante. Faça login novamente.')
    }
    return this.restaurantsService.updateLinktreeRecord(body, req.user.restaurantId);
  }
}
