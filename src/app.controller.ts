import { Controller, Get, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { MinioService } from '@infrastructure/minio.service';
import { AllowAnonymous } from '@libs/decorators/allow-anonymous.decorator';
import express from 'express';

@Controller()
@ApiTags('/')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private minioService: MinioService,
  ) {}

  @Get('get-file-presigned-url')
  @AllowAnonymous()
  async getFilePresignedUrl(@Query('filePath') filePath: string) {
    console.log('getFilePresignedUrl', filePath);
    return this.minioService.getPresignedUrl(filePath);
  }
  @Get('get-file')
  @AllowAnonymous()
  async getFileContent(
    @Query('filePath') filePath: string,
    @Query('contentType') contentType: string,
    @Res() res: express.Response,
  ) {
    const { file } = await this.minioService.getFileObject(filePath);
    res.setHeader('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=3600, immutable'); //cache files for 1 hour by default 1*60*60=3600
    return file.pipe(res);
  }
}
