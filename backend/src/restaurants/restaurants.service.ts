import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../models/restaurant.entity';
import { User } from '../models/user.entity';
import { accessDto, CreateRestaurantDto, LinktreeDto } from '../dtos/restaurant.dto';
import { UpdateRestaurantDto } from '../dtos/update-restaurant.dto';
import { LinktreeRecord } from 'src/models/linktree.entity';
import { RestaurantStatistics } from 'src/models/statistics.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(LinktreeRecord)
    private readonly linktreeRepository: Repository<LinktreeRecord>,
    @InjectRepository(RestaurantStatistics)
    private readonly restaurantStatsRepository: Repository<RestaurantStatistics>
  ) {}

  async createRestaurant(createRestaurantDto: CreateRestaurantDto, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const newRestaurant = this.restaurantRepository.create(createRestaurantDto);
    const savedRestaurant = await this.restaurantRepository.save(newRestaurant);

    user.restaurant = savedRestaurant;
    await this.userRepository.save(user);

    return savedRestaurant;
  }

  async getMyRestaurant(restaurantId: string) {
    if (!restaurantId) {
      throw new NotFoundException('Usuário não possui restaurante vinculado.');
    }
    const restaurant = await this.restaurantRepository.findOne({ where: { id: restaurantId } });
    if (!restaurant) {
      throw new NotFoundException('Restaurante não encontrado.');
    }
    return restaurant;
  }

  async updateMyRestaurant(restaurantId: string, updateRestaurantDto: UpdateRestaurantDto) {
    if (!restaurantId) {
      throw new NotFoundException('Usuário não possui restaurante vinculado.');
    }
    const restaurant = await this.restaurantRepository.findOne({ where: { id: restaurantId } });
    if (!restaurant) {
      throw new NotFoundException('Restaurante não encontrado.');
    }

    Object.assign(restaurant, updateRestaurantDto);
    return this.restaurantRepository.save(restaurant);
  }

  async getLinktreeRecord(restaurantId: string) {
    const record = await this.linktreeRepository.findOne({
        where: { restaurant: { id: restaurantId } }
    });
    return record || {};
  }

  // TODO: create an unique identifier -> name is not unique and used only for MVP
  async getLinktreeByName(restaurantName: string){
    const restaurant = await this.restaurantRepository.findOneByOrFail({
      name: restaurantName
    })

    const record = await this.linktreeRepository.findOne({
        where: { restaurant: { id: restaurant.id } }
    });
    
    return {data: record};
  }

  async updateLinktreeRecord(dto: LinktreeDto, restaurantId: string){
    let record = await this.linktreeRepository.findOne({
        where: {
            restaurant: {
                id: restaurantId,
            },
        },
    });

    if (!record) {
        record = this.linktreeRepository.create({ restaurant: { id: restaurantId } });
    }

    Object.assign(record, dto);

    return this.linktreeRepository.save(record);
  }

  async saveAccessRestaurantStatistic(dto: accessDto){
    const restaurant = await this.restaurantRepository.findOne({where: {name: dto.restaurantName}});
    if (!restaurant) throw new NotFoundException('Restaurante não encontrado.');
    
    const statistics = this.restaurantStatsRepository.create({
      restaurant,
      clickType: dto.clickType
    })

    return this.restaurantStatsRepository.save(statistics);
  }

  async getAccessStatistics(restaurantId: string) {
    const result = await this.restaurantStatsRepository
      .createQueryBuilder('stats')
      .select("SUM(CASE WHEN stats.clickType = 'view' THEN 1 ELSE 0 END)", 'views')
      .addSelect("SUM(CASE WHEN stats.clickType != 'view' THEN 1 ELSE 0 END)", 'clicks')
      .addSelect("SUM(CASE WHEN stats.clickType = 'whatsapp' THEN 1 ELSE 0 END)", 'whatsapp')
      .addSelect("SUM(CASE WHEN stats.clickType = 'menu' THEN 1 ELSE 0 END)", 'menu')
      .addSelect("SUM(CASE WHEN stats.clickType = 'site' THEN 1 ELSE 0 END)", 'site')
      .where('stats.restaurantId = :restaurantId', { restaurantId })
      .getRawOne();

    return { 
      data: { 
        views: Number(result.views || 0),
        clicks: Number(result.clicks || 0),
        clickTypes: {
          whatsapp: Number(result.whatsapp || 0),
          menu: Number(result.menu || 0),
          site: Number(result.site || 0),
        }
      } 
    };
  }
}
