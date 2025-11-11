import { IncludeQuery, CollectionQuery } from '@libs/collection-query';
import { FILE_FOLDERS, CurrentUserDto } from '@libs/common';
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
  CreateUserCommand,
  UpdateUserCommand,
  ArchiveUserCommand,
} from '../usecases/users/user.commands';
import { UserResponse } from '../usecases/users/user.response';
import { UserCommand } from '../usecases/users/user.usecase.command';
import { UserQuery } from '../usecases/users/user.usecase.query';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '@libs/decorators/current-user.decorator';
import { MinioService } from '@infrastructure/minio.service';
import {
  CreateUserRoleCommand,
  CreateBulkUserRoleCommand,
  UpdateUserRoleCommand,
  RemoveUserRoleCommand,
} from '@users/usecases/users/user-role.command';
@Controller('users')
@ApiTags('users')
@ApiResponse({ status: 500, description: 'Internal error' })
@ApiResponse({ status: 404, description: 'Item not found' })
@ApiExtraModels(DataResponseFormat)
export class UserController {
  constructor(
    private command: UserCommand,
    private userQuery: UserQuery,
    private minioService: MinioService,
  ) {}
  @Get('get-user/:id')
  @ApiOkResponse({ type: UserResponse })
  async getUser(@Param('id') id: string, @Query() includeQuery: IncludeQuery) {
    return this.userQuery.getUser(id, includeQuery.includes, true);
  }
  @Get('get-archived-user/:id')
  @ApiOkResponse({ type: UserResponse })
  async getArchivedUser(
    @Param('id') id: string,
    @Query() includeQuery: IncludeQuery,
  ) {
    return this.userQuery.getUser(id, includeQuery.includes, true);
  }
  @Get('get-users')
  @ApiPaginatedResponse(UserResponse)
  async getUsers(
    @Query() query: CollectionQuery,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return this.userQuery.getUsers(query, currentUser);
  }
  @Post('create-user')
  @ApiOkResponse({ type: UserResponse })
  async createUser(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() createUserCommand: CreateUserCommand,
  ) {
    createUserCommand.currentUser = currentUser;
    return this.command.createUser(createUserCommand);
  }
  @Put('update-user')
  @ApiOkResponse({ type: UserResponse })
  async updateUser(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() updateUserCommand: UpdateUserCommand,
  ) {
    updateUserCommand.currentUser = currentUser;
    return this.command.updateUser(updateUserCommand);
  }
  @Delete('archive-user')
  @ApiOkResponse({ type: UserResponse })
  async archiveUser(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() archiveCommand: ArchiveUserCommand,
  ) {
    archiveCommand.currentUser = currentUser;
    return this.command.archiveUser(archiveCommand);
  }
  @Delete('delete-user/:id')
  @ApiOkResponse({ type: Boolean })
  async deleteUser(
    @CurrentUser() currentUser: CurrentUserDto,
    @Param('id') id: string,
  ) {
    return this.command.deleteUser(id, currentUser);
  }
  @Post('restore-user/:id')
  @ApiOkResponse({ type: UserResponse })
  async restoreUser(
    @CurrentUser() currentUser: CurrentUserDto,
    @Param('id') id: string,
  ) {
    return this.command.restoreUser(id, currentUser);
  }
  @Get('get-archived-users')
  @ApiPaginatedResponse(UserResponse)
  async getArchivedUsers(
    @Query() query: CollectionQuery,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return this.userQuery.getArchivedUsers(query, currentUser);
  }
  @Post('update-user-profile-image/:id')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(
            new BadRequestException('Provide a valid Image File'),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: Math.pow(1024, 2) },
    }),
  )
  @ApiOkResponse({ type: UserResponse })
  async updateUserProfileImage(
    @CurrentUser() currentUser: CurrentUserDto,
    @Param('id') id: string,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    if (profileImage) {
      const result = await this.minioService.putObject(
        profileImage,
        FILE_FOLDERS.USER_FOLDER,
      );
      if (result) {
        return this.command.updateUserProfile(id, currentUser, result);
      }
    }
    throw new BadRequestException(`Bad Request`);
  }
  @Post('update-profile-image')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(
            new BadRequestException('Provide a valid Image File'),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: Math.pow(1024, 2) },
    }),
  )
  @ApiOkResponse({ type: UserResponse })
  async updateMyProfileImage(
    @CurrentUser() currentUser: CurrentUserDto,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    if (profileImage) {
      const result = await this.minioService.putObject(
        profileImage,
        FILE_FOLDERS.USER_FOLDER,
      );
      if (result) {
        return this.command.updateUserProfile(
          currentUser.id,
          currentUser,
          result,
        );
      }
    }
    throw new BadRequestException(`Bad Request`);
  }
  // roles
  @Post('create-user-role')
  @ApiOkResponse({ type: UserResponse })
  async createUserRole(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() command: CreateUserRoleCommand,
  ) {
    command.currentUser = currentUser;
    return this.command.addUserRole(command);
  }
  @Post('create-bulk-user-role')
  @ApiOkResponse({ type: UserResponse })
  async createBulkUserRole(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() command: CreateBulkUserRoleCommand,
  ) {
    command.currentUser = currentUser;
    return this.command.addBulkUserRole(command);
  }
  @Put('update-user-role')
  @ApiOkResponse({ type: UserResponse })
  async updateUserRole(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() command: UpdateUserRoleCommand,
  ) {
    command.currentUser = currentUser;
    return this.command.updateUserRole(command);
  }
  @Post('remove-user-role')
  @ApiOkResponse({ type: UserResponse })
  async archiveUserRole(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() command: RemoveUserRoleCommand,
  ) {
    command.currentUser = currentUser;
    return this.command.removeUserRole(command);
  }
  @Get('get-users-by-role/:roleId')
  @ApiPaginatedResponse(UserResponse)
  async getUsersByRole(
    @Param('roleId') roleId: string,
    @Query() query: CollectionQuery,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return this.userQuery.getUsersByRole(roleId, query, currentUser);
  }
}
