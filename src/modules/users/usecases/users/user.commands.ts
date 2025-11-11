import { Address, Gender, CurrentUserDto } from '@libs/common';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { UserEntity } from '../../persistence/users/user.entity';
export class CreateUserCommand {
  @ApiProperty()
  @IsNotEmpty()
  name: string;
  @ApiProperty()
  @IsNotEmpty()
  username: string;
  @ApiProperty({
    example: 'someone@gmail.com',
  })
  @IsEmail()
  email: string;
  @ApiProperty({
    example: '+251911111111',
  })
  @ApiProperty({
    enum: Gender,
  })
  @IsEnum(Gender, {
    message: 'User Gender must be either male or female',
  })
  gender: string;
  @ApiProperty()
  @IsNotEmpty()
  password: string;
  @ApiProperty()
  address: Address;
  currentUser: CurrentUserDto;

  static toEntity(command: CreateUserCommand): UserEntity {
    const entity = new UserEntity();
    entity.name = command.name;
    entity.username = command.username;
    entity.email = command.email;
    entity.gender = command.gender;
    entity.isActive = true;
    entity.address = command.address;
    return entity;
  }
}
export class UpdateUserCommand extends PartialType(CreateUserCommand) {
  @ApiProperty({
    example: 'd02dd06f-2a30-4ed8-a2a0-75c683e3092e',
  })
  @IsNotEmpty()
  id: string;
  @ApiProperty()
  isActive: boolean;
}
export class ArchiveUserCommand {
  @ApiProperty({
    example: 'd02dd06f-2a30-4ed8-a2a0-75c683e3092e',
  })
  @IsNotEmpty()
  id: string;
  @ApiProperty()
  @IsNotEmpty()
  reason: string;
  currentUser: CurrentUserDto;
}
