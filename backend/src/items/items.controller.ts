import { Body, Controller, Get, Post, UseGuards, Req, ForbiddenException, UseInterceptors, UploadedFile, Param, Res, NotFoundException, StreamableFile, Patch, Query, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from "@nestjs/common";
import { CreateItemDto } from "src/dtos/item.dto";
import { ItemsService } from "./items.service";
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../shared/multer.config'
import type { Response } from "express";
import { ApiOperation, ApiConsumes } from "@nestjs/swagger";
import { join } from "path";
import * as fs from 'fs';

import { AuthGuard } from '@nestjs/passport';
import { BucketService } from "src/shared/bucket.service";

@Controller("/items")
export class ItemsController {
    constructor(private readonly itemsService: ItemsService, private readonly uploadService: BucketService) { }

    @ApiOperation({ summary: 'Creates a new Item for the restaurant' })
    @ApiConsumes('multipart/form-data')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('photo'))
    @Post()
    async createItem(
        @Body() body: CreateItemDto,
        @Req() req: any,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
                new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
                ],
                fileIsRequired: false,
            }),
        ) photo?: Express.Multer.File,
    ) {
        if (!req.user.restaurantId) {
            throw new ForbiddenException('Usuário não possui restaurante vinculado.');
        }

        let imageUrl: string | undefined;

        if (photo) {
        imageUrl = await this.uploadService.uploadImage(photo);
        }

        return this.itemsService.createItem(body, req.user.restaurantId, imageUrl);
    }

    @ApiOperation({ summary: 'Gets all public Restaurant items' })
    @Get('/public')
    async getPublicItems(@Query('restaurantName') restaurantName: string) {
        return this.itemsService.getItems(/*isOnlyPublic=*/ true, undefined, restaurantName);
    }

    @ApiOperation({ summary: 'Gets all Restaurant items' })
    @Get()
    @UseGuards(AuthGuard('jwt'))
    async getItems(@Req() req: any) {
        return this.itemsService.getItems(/*isOnlyPublic=*/ false, req.user.restaurantId);
    }

    @Patch('visibility')
    @UseGuards(AuthGuard('jwt'))
    async changeItemsVisibility(@Body() body: { ids: string[] }, @Req() req: any) {
        return this.itemsService.changeVisibility(body.ids, req.user.restaurantId);
    }
}