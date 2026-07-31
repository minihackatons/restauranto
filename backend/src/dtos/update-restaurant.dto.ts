import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateRestaurantDto {
    @ApiProperty({ example: 'My Awesome Restaurant', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: '12.345.678/0001-90', required: false })
    @IsString()
    @IsOptional()
    document?: string;

    @ApiProperty({ example: '123 Main St', required: false })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({ example: '+1 555 1234', required: false })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ example: 'https://s3.aws.com/...', required: false })
    @IsString()
    @IsOptional()
    logoUrl?: string;
}
