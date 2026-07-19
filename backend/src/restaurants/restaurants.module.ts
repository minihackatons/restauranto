import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from '../models/restaurant.entity';
import { User } from '../models/user.entity';
import { LinktreeRecord } from '../models/linktree.entity';
import { RestaurantStatistics } from '../models/statistics.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, User, LinktreeRecord, RestaurantStatistics])],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}
