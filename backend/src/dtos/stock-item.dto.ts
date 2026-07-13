import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

import { PartialType } from '@nestjs/mapped-types';

export class CreateStockItemDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  measureUnit!: string;

  @IsNumber()
  @Min(0)
  stockAmount!: number;

  @IsNumber()
  @Min(0)
  maxStock!: number;

  @IsNumber()
  @IsPositive()
  cost!: number;

  @IsUUID()
  restaurantId!: string;
}

export class UpdateStockItemDto extends PartialType(CreateStockItemDto) {}