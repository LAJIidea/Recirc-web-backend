import { Injectable } from "@nestjs/common";
import * as Minio from 'minio';
import { minioConfig } from "../config/minio.config";
import {
  MinIOFiles,
  TFile,
  TFileData,
  TFolder
} from './types'

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

  async pushObject(bucketName: string, objectName: string, obj: string) {
    try {
      await this.minioClient.putObject(bucketName, objectName, obj);
      console.log('Object push successfully');
    } catch (err) {
      console.error('Error push object: ', err)
      throw err;
    }
  }

  async getObject(bucketName: string, objectName: string) {
    try {
      let data = await new Promise((resolve, reject) => {
        this.minioClient.getObject(bucketName, objectName).then((stream) => {
          let content = '';
          stream.on('data', (chunk) => {
            content += chunk;
          });
          
          stream.on('end', () => {
            resolve(content);
          });

          stream.on('error', (err) => {
            reject(err);
          })
        })
      })
      return data as string;
    } catch (err) {
      console.error('Error get object: ', err)
      throw err;
    }
  }

  async getSandboxFiles(id: string) {
    const content =  await this.getObject(minioConfig.bucketName, id);
    const data: MinIOFiles = JSON.parse(content);
    
    const paths = data.objects.map((obj) => obj.key);
    const processedFiles = await this.processFiles(paths, id);
    return processedFiles;
  }

  processFiles = async (paths: string[], id: string) => {
    const root: TFolder = { id: "/", type: "folder", name: "/", children: []};
    const fileData: TFileData[] = [];
  
    paths.forEach((path) => {
      const allParts = path.split("/");
      if (allParts[1] !== id) {
        return;
      }
  
      const parts = allParts.slice(2);
      let current: TFolder = root;
  
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFile = i === parts.length - 1 && part.includes(".");
        const existing = current.children.find((child) => child.name === part);
  
        if (existing) {
          if (!isFile) {
            current = existing as TFolder;
          }
        } else {
          if (isFile) {
            const file: TFile = { id: path, type: "file", name: part };
            current.children.push(file);
            fileData.push({ id: path, data: "" });
          } else {
            const folder: TFolder = {
              id: `projects/${id}/${parts.slice(0, i + 1).join("/")}`,
              type: "folder",
              name: part,
              children: [],
            };
            current.children.push(folder);
            current = folder;
          }
        }
      }
    });
  
    await Promise.all(
      fileData.map(async (file) => {
        const data = await this.fetchFileContent(file.id);
        file.data = data;
      })
    );
  
    return {
      files: root.children,
      fileData,
    }
  }
  
  getFolder = async (folderId: string) => {
    const res = await this.getObject(minioConfig.bucketName, folderId);
    const data: MinIOFiles = JSON.parse(res);

    return data.objects.map((obj) => obj.key);
  }

  fetchFileContent = async (fileId: string): Promise<string> => {
    try {
      const data = await this.getObject(minioConfig.bucketName, fileId);
      return data; 
    } catch (error) {
      console.error("Error fetching file: ", error);
      return "";
    }
  };
}