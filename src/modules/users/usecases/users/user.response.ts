import { FileDto, Address } from '@libs/common';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../persistence/users/user.entity';
import { UserRoleResponse } from './user-role.response';
export class UserResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  username: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  gender: string;
  @ApiProperty()
  profilePicture: FileDto;
  @ApiProperty()
  isActive: boolean;
  @ApiProperty()
  address: Address;
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
  userRoles?: UserRoleResponse[];

  static toResponse(entity: UserEntity): UserResponse {
    const response = new UserResponse();
    response.id = entity.id;
    response.name = entity.name;
    response.username = entity.username;
    response.email = entity.email;
    response.gender = entity.gender;
    response.profilePicture = entity.profilePicture;
    response.isActive = entity.isActive;
    response.address = entity.address;
    response.createdBy = entity.createdBy;
    response.updatedBy = entity.updatedBy;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    response.deletedAt = entity.deletedAt;
    response.deletedBy = entity.deletedBy;
    if (entity.userRoles) {
      response.userRoles = entity.userRoles.map((userRole) =>
        UserRoleResponse.toResponse(userRole),
      );
    }
    return response;
  }
}
