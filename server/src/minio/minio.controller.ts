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
}
