import { Controller, Post, Body, Param, Get, Query } from "@nestjs/common";
import { MinioService } from "./minio.service";

@Controller("minio")
export class MinioController {
  constructor(private readonly minioService: MinioService) {}

  @Post('upload')
  async uploadFile(@Body() body: { bucketName: string; fileName: string; filePath: string }) {
    const { bucketName, fileName, filePath } = body;
    await this.minioService.uploadFile(bucketName, fileName, filePath);
    return { message: 'File uploaded successfully' };
  }

  @Get('download')
  async downloadFile(@Query('bucketName') bucketName: string, @Query('fileName') fileName: string) {
    const downloadPath = `./downloads/${fileName}`;
    await this.minioService.downloadFile(bucketName, fileName, downloadPath);
    return { message: 'File downloaded successfully', path: downloadPath };
  }


  @Post('push')
  async pushObject(@Body() body: { bucketName: string; objName: string; obj: string }) {
    const { bucketName, objName, obj } = body;
    await this.minioService.pushObject(bucketName, objName, obj);
    return { message: 'Push object successfully' };
  }

  @Get('get')
  async getObject(@Query('bucketName') bucketName: string, @Query('objName') objName: string) {
    let data = await this.minioService.getObject(bucketName, objName);
    return { message: 'File downloaded successfully', content: data };
  }
}
