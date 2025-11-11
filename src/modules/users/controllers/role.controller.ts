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
import { RoleResponse } from '../usecases/roles/role.response';
import { RoleCommand } from '../usecases/roles/role.usecase.command';
import { RoleQuery } from '../usecases/roles/role.usecase.query';
import { CurrentUser } from '@libs/decorators/current-user.decorator';
import { CreateRoleCommand, UpdateRoleCommand, ArchiveRoleCommand } from '@users/usecases/roles/role.command';

@Controller('roles')
@ApiTags('roles')
@ApiResponse({ status: 500, description: 'Internal error' })
@ApiResponse({ status: 404, description: 'Item not found' })
@ApiExtraModels(DataResponseFormat)
export class RoleController {
  constructor(
    private command: RoleCommand,
    private roleQuery: RoleQuery,
  ) {}
  @Get('get-role/:id')
  @ApiOkResponse({ type: RoleResponse })
  async getRole(@Param('id') id: string, @Query() includeQuery: IncludeQuery) {
    return this.roleQuery.getRole(id, includeQuery.includes, true);
  }
  @Get('get-archived-role/:id')
  @ApiOkResponse({ type: RoleResponse })
  async getArchivedRole(
    @Param('id') id: string,
    @Query() includeQuery: IncludeQuery,
  ) {
    return this.roleQuery.getRole(id, includeQuery.includes, true);
  }
  @Get('get-roles')
  @ApiPaginatedResponse(RoleResponse)
  async getRoles(
    @Query() query: CollectionQuery,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return this.roleQuery.getRoles(query, currentUser);
  }
  @Post('create-role')
  @ApiOkResponse({ type: RoleResponse })
  async createRole(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() createRoleCommand: CreateRoleCommand,
  ) {
    createRoleCommand.currentUser = currentUser;
    return this.command.createRole(createRoleCommand);
  }
  @Put('update-role')
  @ApiOkResponse({ type: RoleResponse })
  async updateRole(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() updateRoleCommand: UpdateRoleCommand,
  ) {
    updateRoleCommand.currentUser = currentUser;
    return this.command.updateRole(updateRoleCommand);
  }
  @Delete('archive-role')
  @ApiOkResponse({ type: RoleResponse })
  async archiveRole(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() archiveCommand: ArchiveRoleCommand,
  ) {
    archiveCommand.currentUser = currentUser;
    return this.command.archiveRole(archiveCommand);
  }
  @Delete('delete-role/:id')
  @ApiOkResponse({ type: Boolean })
  async deleteRole(
    @CurrentUser() currentUser: CurrentUserDto,
    @Param('id') id: string,
  ) {
    return this.command.deleteRole(id, currentUser);
  }
  @Post('restore-role/:id')
  @ApiOkResponse({ type: RoleResponse })
  async restoreRole(
    @CurrentUser() currentUser: CurrentUserDto,
    @Param('id') id: string,
  ) {
    return this.command.restoreRole(id, currentUser);
  }
  @Get('get-archived-roles')
  @ApiPaginatedResponse(RoleResponse)
  async getArchivedRoles(
    @Query() query: CollectionQuery,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return this.roleQuery.getArchivedRoles(query, currentUser);
  }
}
