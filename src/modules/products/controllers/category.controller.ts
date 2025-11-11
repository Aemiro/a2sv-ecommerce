import { IncludeQuery, CollectionQuery } from '@libs/collection-query';
import { CurrentUserDto } from '@libs/common';
import {
  DataResponseFormat,
  ApiPaginatedResponse,
} from '@libs/response-format';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateCategoryCommand,
  UpdateCategoryCommand,
  ArchiveCategoryCommand,
} from '../usecases/categories/category.commands';
import { CategoryResponse } from '../usecases/categories/category.response';
import { CategoryCommand } from '../usecases/categories/category.usecase.command';
import { CategoryQuery } from '../usecases/categories/category.usecase.query';
import { MinioService } from '@infrastructure/minio.service';
import { CurrentUser } from '@libs/decorators/current-user.decorator';
@Controller('categories')
@ApiTags('categories')
@ApiResponse({ status: 500, description: 'Internal error' })
@ApiResponse({ status: 404, description: 'Item not found' })
@ApiExtraModels(DataResponseFormat)
export class CategoryController {
  constructor(
    private command: CategoryCommand,
    private categoryQuery: CategoryQuery,
    private minioService: MinioService,
  ) {}
  @Get('get-category/:id')
  @ApiOkResponse({ type: CategoryResponse })
  async getCategory(
    @Param('id') id: string,
    @Query() includeQuery: IncludeQuery,
  ) {
    return this.categoryQuery.getCategory(id, includeQuery.includes, true);
  }
  @Get('get-archived-category/:id')
  @ApiOkResponse({ type: CategoryResponse })
  async getArchivedCategory(
    @Param('id') id: string,
    @Query() includeQuery: IncludeQuery,
  ) {
    return this.categoryQuery.getCategory(id, includeQuery.includes, true);
  }
  @Get('get-categories')
  @ApiPaginatedResponse(CategoryResponse)
  async getCategories(
    @Query() query: CollectionQuery,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return this.categoryQuery.getCategories(query, currentUser);
  }
  @Post('create-category')
  @ApiOkResponse({ type: CategoryResponse })
  async createCategory(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() createCategoryCommand: CreateCategoryCommand,
  ) {
    createCategoryCommand.currentUser = currentUser;
    return this.command.createCategory(createCategoryCommand);
  }
  @Put('update-category')
  @ApiOkResponse({ type: CategoryResponse })
  async updateCategory(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() updateCategoryCommand: UpdateCategoryCommand,
  ) {
    updateCategoryCommand.currentUser = currentUser;
    return this.command.updateCategory(updateCategoryCommand);
  }
  @Delete('archive-category')
  @ApiOkResponse({ type: CategoryResponse })
  async archiveCategory(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() archiveCommand: ArchiveCategoryCommand,
  ) {
    archiveCommand.currentUser = currentUser;
    return this.command.archiveCategory(archiveCommand);
  }
  @Delete('delete-category/:id')
  @ApiOkResponse({ type: Boolean })
  async deleteCategory(
    @CurrentUser() currentUser: CurrentUserDto,
    @Param('id') id: string,
  ) {
    return this.command.deleteCategory(id, currentUser);
  }
  @Post('restore-category/:id')
  @ApiOkResponse({ type: CategoryResponse })
  async restoreCategory(
    @CurrentUser() currentUser: CurrentUserDto,
    @Param('id') id: string,
  ) {
    return this.command.restoreCategory(id, currentUser);
  }
  @Get('get-archived-categories')
  @ApiPaginatedResponse(CategoryResponse)
  async getArchivedCategories(
    @Query() query: CollectionQuery,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return this.categoryQuery.getArchivedCategories(query, currentUser);
  }
}
