import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemDto {
  @ApiProperty({ example: 'X-Burger' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Hambúrguer artesanal de 180g.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 25.50 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  categoryId!: number;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  photo?: any;

  @ApiPropertyOptional({ example: '[{"stockItemId": 1, "amount": 2.5}]' })
  @IsString()
  @IsOptional()
  ingredients?: string;
}

import { PartialType } from '@nestjs/swagger';

export class UpdateItemDto extends PartialType(CreateItemDto) {}