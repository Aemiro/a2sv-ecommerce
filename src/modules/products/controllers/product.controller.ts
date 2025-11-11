import { IncludeQuery, CollectionQuery } from '@libs/collection-query';
import { CurrentUserDto, FILE_FOLDERS } from '@libs/common';
import {
  DataResponseFormat,
  ApiPaginatedResponse,
} from '@libs/response-format';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateProductCommand,
  UpdateProductCommand,
  ArchiveProductCommand,
} from '../usecases/products/product.commands';
import { ProductResponse } from '../usecases/products/product.response';
import { ProductCommand } from '../usecases/products/product.usecase.command';
import { ProductQuery } from '../usecases/products/product.usecase.query';
import { MinioService } from '@infrastructure/minio.service';
import { CurrentUser } from '@libs/decorators/current-user.decorator';
import {
  CreateProductImageCommand,
  UpdateProductImageCommand,
  RemoveProductImageCommand,
} from '@products/usecases/products/product-image.command';
import { FileInterceptor } from '@nestjs/platform-express';
import { AllowAnonymous } from '@libs/decorators/allow-anonymous.decorator';
@Controller('products')
@ApiTags('products')
@ApiResponse({ status: 500, description: 'Internal error' })
@ApiResponse({ status: 404, description: 'Item not found' })
@ApiExtraModels(DataResponseFormat)
export class ProductController {
  constructor(
    private command: ProductCommand,
    private productQuery: ProductQuery,
    private minioService: MinioService,
  ) {}
  @Get('get-product/:id')
  @AllowAnonymous()
  @ApiOkResponse({ type: ProductResponse })
  async getProduct(
    @Param('id') id: string,
    @Query() includeQuery: IncludeQuery,
  ) {
    return this.productQuery.getProduct(id, includeQuery.includes, true);
  }
  @Get('get-archived-product/:id')
  @ApiOkResponse({ type: ProductResponse })
  async getArchivedProduct(
    @Param('id') id: string,
    @Query() includeQuery: IncludeQuery,
  ) {
    return this.productQuery.getProduct(id, includeQuery.includes, true);
  }
  @Get('get-products')
  @AllowAnonymous()
  @ApiPaginatedResponse(ProductResponse)
  async getProducts(
    @Query() query: CollectionQuery,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return this.productQuery.getProducts(query, currentUser);
  }
  @Post('create-product')
  @ApiOkResponse({ type: ProductResponse })
  async createProduct(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() createProductCommand: CreateProductCommand,
  ) {
    createProductCommand.currentUser = currentUser;
    return this.command.createProduct(createProductCommand);
  }
  @Put('update-product')
  @ApiOkResponse({ type: ProductResponse })
  async updateProduct(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() updateProductCommand: UpdateProductCommand,
  ) {
    updateProductCommand.currentUser = currentUser;
    return this.command.updateProduct(updateProductCommand);
  }
  @Delete('archive-product')
  @ApiOkResponse({ type: ProductResponse })
  async archiveProduct(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() archiveCommand: ArchiveProductCommand,
  ) {
    archiveCommand.currentUser = currentUser;
    return this.command.archiveProduct(archiveCommand);
  }
  @Delete('delete-product/:id')
  @ApiOkResponse({ type: Boolean })
  async deleteProduct(
    @CurrentUser() currentUser: CurrentUserDto,
    @Param('id') id: string,
  ) {
    return this.command.deleteProduct(id, currentUser);
  }
  @Post('restore-product/:id')
  @ApiOkResponse({ type: ProductResponse })
  async restoreProduct(
    @CurrentUser() currentUser: CurrentUserDto,
    @Param('id') id: string,
  ) {
    return this.command.restoreProduct(id, currentUser);
  }
  @Get('get-archived-products')
  @ApiPaginatedResponse(ProductResponse)
  async getArchivedProducts(
    @Query() query: CollectionQuery,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return this.productQuery.getArchivedProducts(query, currentUser);
  }
  @Post('add-product-image/:productId')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(
            new BadRequestException('Provide a valid Image File'),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: Math.pow(1024, 5) },
    }),
  )
  @ApiOkResponse({ type: ProductResponse })
  async addProductImage(
    @CurrentUser() currentUser: CurrentUserDto,
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() command: CreateProductImageCommand,
  ) {
    command.currentUser = currentUser;
    command.productId = productId;
    if (file) {
      const result = await this.minioService.putObject(
        file,
        FILE_FOLDERS.PRODUCT_FOLDER,
      );
      if (result) {
        command.file = result;
        return this.command.addProductImage(command);
      }
    }
    throw new BadRequestException(`Bad Request`);
  }
  @Put('update-product-image')
  @ApiOkResponse({ type: ProductResponse })
  async updateProductImage(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() command: UpdateProductImageCommand,
  ) {
    command.currentUser = currentUser;
    return this.command.updateProductImage(command);
  }
  @Post('remove-product-image')
  @ApiOkResponse({ type: ProductResponse })
  async archiveProductImage(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() command: RemoveProductImageCommand,
  ) {
    command.currentUser = currentUser;
    return this.command.removeProductImage(command);
  }
}
