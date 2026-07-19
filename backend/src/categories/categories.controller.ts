import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { Body, Post, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { CreateCategoryDto } from '../dtos/categories.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Gets all Categories' })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getCategories(@Req() req: any) {
    if (!req.user.restaurantId) {
      throw new ForbiddenException('Usuário não possui restaurante vinculado.');
    }
    return this.categoriesService.findAll(req.user.restaurantId);
  }

  @ApiOperation({ summary: 'Gets a specific Category by id' })
  @Get(':id')
  async getCategory(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @ApiOperation({ summary: 'Create a new Category' })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createCategory(@Body() body: CreateCategoryDto, @Req() req: any) {
    console.log(body)
    if (!req.user.restaurantId) {
      throw new ForbiddenException('Usuário não possui restaurante vinculado.');
    }
    return this.categoriesService.createCategory(body, req.user.restaurantId);
  }
}
