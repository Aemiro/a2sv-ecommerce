import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as Minio from 'minio';
import { lookup } from 'mime-types';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
console.log(process.env['MINIO_HOST']);
@Injectable()
export class MinioService {
  private readonly bucketName: string;
  minioClient;
  constructor() {
    this.bucketName = process.env.MINIO_BUCKET_NAME as string;
    this.minioClient = new Minio.Client({
      endPoint: process.env['MINIO_CONTAINER_NAME'] || '',
      port: process.env['MINIO_PORT']
        ? parseInt(process.env['MINIO_PORT'])
        : 9000,
      useSSL: process.env['MINIO_USE_SSL'] === 'true' ? true : false,
      accessKey: process.env['MINIO_ACCESS_KEY'] || '',
      secretKey: process.env['MINIO_SECRET_KEY'] || '',
      region: process.env['MINIO_REGION']
        ? process.env['MINIO_REGION']
        : 'us-east-1',
    });
    this.seedBuckets()
      .then((res) => console.log(`Bucket ${this.bucketName} Created`, res))
      .catch((err) => console.error(err));
  }
  async putObject(
    file: Express.Multer.File,
    folderName: string,
    metadata = {},
  ) {
    try {
      const uuidFileName = new Date().getTime();
      const fileExtension = path.extname(file.originalname);
      const objectName = `${folderName}/${uuidFileName}${fileExtension}`;
      const stream = file.buffer;

      const result = await this.minioClient
        .putObject(this.bucketName, objectName, stream, file.size, metadata)
        .catch((e) => {
          console.error(e);
          throw new Error('Error processing file upload');
        });
      console.log('Object uploaded successfully: ', result);
      return {
        originalName: file.originalname,
        name: objectName,
        type: file.mimetype,
        size: file.size,
        bucketName: this.bucketName,
      };
    } catch (error) {
      console.error('Error:', error);
      // return 'Error processing file upload';
      throw new Error('Error processing file upload');
    }
  }
  async uploadFile(fileName: string, folderName: string, metadata = {}) {
    try {
      const objectName = `${folderName}/${fileName}`;
      const result = await this.minioClient
        .fPutObject(this.bucketName, objectName, `/tmp/${fileName}`, metadata)
        .catch((e) => {
          console.error(e);
          throw new Error('Error processing file upload');
        });
      console.log('Object uploaded successfully: ', result);
      const fileStat = fs.statSync(`/tmp/${fileName}`);
      return {
        originalName: fileName,
        name: objectName,
        type: lookup(`/tmp/${fileName}`),
        size: fileStat.size,
        bucketName: this.bucketName,
      };
    } catch (error) {
      console.error('Error:', error);
      // return 'Error processing file upload';
      throw new Error('Error processing file upload');
    }
  }
  async getPresignedUrl(objectName: string, expiresInSecond = 360) {
    return await this.minioClient.presignedGetObject(
      this.bucketName,
      objectName,
      expiresInSecond,
    );
  }
  async isFileExist(fileName: string, option = {}) {
    const stat = await this.minioClient
      .statObject(this.bucketName, fileName, option)
      .catch((e) => {
        console.error(e);
        return false;
      });
    console.log(stat);
    return stat;
  }
  async deleteFile(objectName: string, option = {}) {
    const isFileExist = await this.isFileExist(objectName);
    if (!isFileExist) {
      return false;
    }
    await this.minioClient
      .removeObject(this.bucketName, objectName, option)
      .catch((e: any) => {
        console.error(e);
        return false;
      });
    return true;
  }
  async getFileObject(address: string) {
    try {
      const fileInfo = await this.minioClient.statObject(
        this.bucketName,
        address,
      );
      const contentType = fileInfo.metaData['content-type'];
      const file = await this.minioClient.getObject(this.bucketName, address);
      return {
        file,
        contentType,
      };
    } catch (err) {
      console.error(err?.message);
      throw new NotFoundException('File not found');
    }
  }
  async seedBuckets() {
    const bucketExists = await this.minioClient.bucketExists(this.bucketName);
    if (!bucketExists) {
      const bucketRegion = process.env['MINIO_REGION']
        ? process.env['MINIO_REGION']
        : 'us-east-1';
      await this.minioClient.makeBucket(this.bucketName, bucketRegion);
    }
  }
}
