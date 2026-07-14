import { Body, Controller, Get, Post, UseGuards, Req, ForbiddenException, UseInterceptors, UploadedFile, Param, Res, NotFoundException, StreamableFile, Patch } from "@nestjs/common";
import { CreateItemDto } from "src/dtos/item.dto";
import { ItemsService } from "./items.service";
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../shared/multer.config'
import type { Response } from "express";
import { ApiOperation, ApiConsumes } from "@nestjs/swagger";
import { join } from "path";
import * as fs from 'fs';

import { AuthGuard } from '@nestjs/passport';

@Controller("/items")
export class ItemsController {
    constructor(private readonly itemsService: ItemsService){}

    @ApiOperation({ summary: 'Creates a new Item for the restaurant' })
    @ApiConsumes('multipart/form-data')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('photo', multerOptions))
    @Post()
    async createItem (
        @Body() body: CreateItemDto,
        @Req() req: any,
        @UploadedFile() photo?: Express.Multer.File
    ){
        if (!req.user.restaurantId) {
            throw new ForbiddenException('Usuário não possui restaurante vinculado.');
        }
        
        let filename = photo?.filename;
        if (!filename && photo?.path) {
            filename = photo.path.replace(/^.*[\\\/]/, '');
        }

        return this.itemsService.createItem(body, req.user.restaurantId, filename);
    }

    @ApiOperation({summary: 'Gets all public Restaurant items'})
    @Get('/public')
    async getPublicItems(){
        return this.itemsService.getItems(/*isOnlyPublic=*/ true);
    }

    @ApiOperation({summary: 'Gets all Restaurant items'})
    @Get()
    @UseGuards(AuthGuard('jwt'))
    async getItems(){
        return this.itemsService.getItems(/*isOnlyPublic=*/ false);
    }

    @Get(':filename')
    getPhotos(@Param('filename') filename: string, @Res() res: Response){
        const filePath = join(process.cwd(), 'uploads', filename);
        
        if (!fs.existsSync(filePath)) {
            throw new NotFoundException('Image not found');
        }
        
        res.sendFile(filePath);
    }

    @Patch('visibility')
    @UseGuards(AuthGuard('jwt'))
    async changeItemsVisibility(@Body() body: { ids: string[] }){
        return this.itemsService.changeVisibility(body.ids);
    }
}