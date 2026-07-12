import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRestaurantDto {
    @ApiProperty({ example: 'My Awesome Restaurant' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: '12.345.678/0001-90' })
    @IsString()
    @IsNotEmpty()
    document!: string;

    @ApiProperty({ example: '123 Main St' })
    @IsString()
    @IsNotEmpty()
    address!: string;

    @ApiProperty({ example: '+1 555 1234' })
    @IsString()
    @IsOptional()
    phone?: string;
}

export class LinktreeDto {
    site?: string;
    whatsapp?: string;
    menu?: string;
}