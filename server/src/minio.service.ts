import { Injectable } from "@nestjs/common";
import * as Minio from 'minio';
import { minioConfig } from "./config/minio.config";

@Injectable()
export class MinioService {
  private minioClient: Minio.Client;

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: minioConfig.endPoint,
      port: minioConfig.port,
      useSSL: minioConfig.useSSL,
      accessKey: minioConfig.accessKey,
      secretKey: minioConfig.secretKey
    });
  }

  async uploadFile(bucketName: string, fileName: string, filePath: string) {
    try {
      await this.minioClient.fPutObject(bucketName, fileName, filePath);
      console.log('File uploaded successfully');
    } catch (errr) {
      console.error('Error uploading file: ', errr);
      throw errr;
    }
  }

  async downloadFile(bucketName: string, fileName: string, donwloadPath: string) {
    try {
      await this.minioClient.fGetObject(bucketName, fileName, donwloadPath);
      console.log('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file: ', error);
      throw error;
    }
  }
}