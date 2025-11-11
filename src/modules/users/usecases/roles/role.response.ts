import { ApiProperty } from '@nestjs/swagger';
import { RoleEntity } from '@users/persistence/roles/role.entity';

export class RoleResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  key: string;
  @ApiProperty()
  description?: string;
  @ApiProperty()
  isActive: boolean;
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
  static toResponse(entity: RoleEntity): RoleResponse {
    const response = new RoleResponse();
    response.id = entity.id;
    response.name = entity.name;
    response.key = entity.key;
    response.description = entity.description;
    response.isActive = entity.isActive;
    response.createdBy = entity.createdBy;
    response.updatedBy = entity.updatedBy;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    response.deletedAt = entity.deletedAt;
    response.deletedBy = entity.deletedBy;
    return response;
  }
}
