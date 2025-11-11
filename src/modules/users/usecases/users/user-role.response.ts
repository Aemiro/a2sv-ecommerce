import { ApiProperty } from '@nestjs/swagger';
import { RoleResponse } from '../roles/role.response';
import { UserRoleEntity } from '../../persistence/users/user-role.entity';
export class UserRoleResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  roleId: string;
  @ApiProperty()
  createdBy?: string;
  @ApiProperty()
  updatedBy?: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  deletedAt?: Date;
  @ApiProperty()
  deletedBy?: string;
  role?: RoleResponse;
  static toResponse(entity: UserRoleEntity): UserRoleResponse {
    const response = new UserRoleResponse();
    response.id = entity.id;
    response.userId = entity.userId;
    response.roleId = entity.roleId;
    response.createdBy = entity.createdBy;
    response.updatedBy = entity.updatedBy;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    response.deletedAt = entity.deletedAt;
    response.deletedBy = entity.deletedBy;
    if (entity.role) {
      response.role = RoleResponse.toResponse(entity.role);
    }
    return response;
  }
}
