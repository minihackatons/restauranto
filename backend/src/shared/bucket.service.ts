import { Injectable } from '@nestjs/common'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class BucketService {
    private readonly s3Client: S3Client;

    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION
        });
    }

    async uploadImage(file: Express.Multer.File): Promise<string>{
        const bucketName = process.env.AWS_S3_BUCKET_NAME;
        const uniqueKey = `${Date.now()}-${file.originalname}`;

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: uniqueKey,
            Body: file.buffer,
            ContentType: file.mimetype
        })

        await this.s3Client.send(command);

        return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;
    }
}