import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Gets all Categories' })
  @Get()
  async getCategories() {
    return this.categoriesService.findAll();
  }

  @ApiOperation({ summary: 'Gets a specific Category by id' })
  @Get(':id')
  async getCategory(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }
}
