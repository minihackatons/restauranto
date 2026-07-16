import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../models/restaurant.entity';
import { User } from '../models/user.entity';
import { CreateRestaurantDto, LinktreeDto } from '../dtos/restaurant.dto';
import { UpdateRestaurantDto } from '../dtos/update-restaurant.dto';
import { LinktreeRecord } from 'src/models/linktree.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(LinktreeRecord)
    private readonly linktreeRepository: Repository<LinktreeRecord>
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
}
