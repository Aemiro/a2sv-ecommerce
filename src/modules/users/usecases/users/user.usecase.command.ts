import { FileDto, CurrentUserDto } from '@libs/common';
import { UserEntity } from '../../persistence/users/user.entity';
import { UserRepository } from '../../persistence/users/user.repository';
import {
  ArchiveUserCommand,
  CreateUserCommand,
  UpdateUserCommand,
} from './user.commands';
import { UserResponse } from './user.response';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { Util } from '@libs/util';
import {
  CreateBulkUserRoleCommand,
  CreateUserRoleCommand,
  RemoveUserRoleCommand,
  UpdateUserRoleCommand,
} from './user-role.command';
import { RoleRepository } from '@users/persistence/roles/role.repository';
import { RoleEntity } from '@users/persistence/roles/role.entity';
import { UserRoleEntity } from '@users/persistence/users/user-role.entity';
@Injectable()
export class UserCommand implements OnModuleInit {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}
  async onModuleInit() {
    let adminRole = await this.roleRepository.getOneBy(
      'key',
      'admin',
      [],
      true,
    );
    if (!adminRole) {
      const newAdminRole = new RoleEntity();
      newAdminRole.key = 'admin';
      newAdminRole.name = 'Admin';
      newAdminRole.description = 'Admin Role';
      adminRole = await this.roleRepository.insert(newAdminRole);
    }
    const existingAdmin = await this.userRepository.getOneBy(
      'email',
      'admin@gmail.com',
      [],
      true,
    );
    if (!existingAdmin) {
      const defaultAdmin = new UserEntity();
      defaultAdmin.name = 'Supper Admin';
      defaultAdmin.username = 'superadmin';
      defaultAdmin.email = 'admin@gmail.com';
      defaultAdmin.password = Util.hashPassword('P@ssw0rd2018');
      defaultAdmin.isActive = true;
      defaultAdmin.gender = 'Male';
      const user = await this.userRepository.insert(defaultAdmin);
      const userRole = new UserRoleEntity();
      userRole.userId = user.id;
      userRole.roleId = adminRole.id;
      userRole.createdBy = user.id;
      userRole.updatedBy = user.id;
      user.userRoles = [];
      user.addUserRole(userRole);
      const updatedUser = await this.userRepository.save(user);
      console.log('Inserted User ', updatedUser);
    }
  }
  async createUser(command: CreateUserCommand): Promise<UserResponse> {
    if (
      command.email &&
      (await this.userRepository.getOneBy('email', command.email, [], true))
    ) {
      throw new BadRequestException(
        `User already exist with this email Address`,
      );
    }
    const userDomain = CreateUserCommand.toEntity(command);
    userDomain.password = Util.hashPassword(command.password);
    userDomain.createdBy = command.currentUser.id;
    userDomain.updatedBy = command.currentUser.id;

    const user = await this.userRepository.insert(userDomain);
    return UserResponse.toResponse(user);
  }
  async updateUser(command: UpdateUserCommand): Promise<UserResponse> {
    const userDomain = await this.userRepository.getById(command.id);
    if (!userDomain) {
      throw new NotFoundException(`User not found with id ${command.id}`);
    }
    if (userDomain.username !== command.username) {
      const user = await this.userRepository.getOneBy(
        'username',
        command.username,
        [],
        true,
      );
      if (user) {
        throw new BadRequestException(`User already exist with this username`);
      }
    }
    if (
      command.email &&
      userDomain.email !== command.email &&
      (await this.userRepository.getOneBy('email', command.email, [], true))
    ) {
      throw new BadRequestException(
        `User already exist with this email Address`,
      );
    }
    userDomain.email = command?.email ?? userDomain.email;
    userDomain.name = command.name ?? userDomain.name;
    userDomain.username = command.username ?? userDomain.username;
    userDomain.isActive = command.isActive;
    userDomain.gender = command.gender ?? userDomain.gender;
    userDomain.address = command.address ?? userDomain.address;
    userDomain.updatedBy = command?.currentUser?.id;
    const user = await this.userRepository.save(userDomain);
    return UserResponse.toResponse(user);
  }
  async archiveUser(command: ArchiveUserCommand): Promise<UserResponse> {
    const userDomain = await this.userRepository.getById(command.id);
    if (!userDomain) {
      throw new NotFoundException(`User not found with id ${command.id}`);
    }
    userDomain.deletedAt = new Date();
    userDomain.deletedBy = command.currentUser.id;
    const result = await this.userRepository.save(userDomain);

    return UserResponse.toResponse(result);
  }
  async restoreUser(
    id: string,
    currentUser: CurrentUserDto,
  ): Promise<UserResponse> {
    const userDomain = await this.userRepository.getById(id, [], true);
    if (!userDomain) {
      throw new NotFoundException(`User not found with id ${id}`);
    }
    await this.userRepository.restore(id);
    userDomain.deletedAt = undefined;
    return UserResponse.toResponse(userDomain);
  }
  async deleteUser(id: string, currentUser: CurrentUserDto): Promise<boolean> {
    const userDomain = await this.userRepository.getById(id, [], true);
    if (!userDomain) {
      throw new NotFoundException(`User not found with id ${id}`);
    }
    const result = await this.userRepository.delete(id);
    return result;
  }
  async activateOrBlockUser(
    id: string,
    currentUser: CurrentUserDto,
  ): Promise<UserResponse | null> {
    const userDomain = await this.userRepository.getById(id);
    if (!userDomain) {
      throw new NotFoundException(`User not found with id ${id}`);
    }
    userDomain.isActive = !userDomain.isActive;
    const result = await this.userRepository.save(userDomain);

    return UserResponse.toResponse(result);
  }
  async updateUserProfile(
    userId: string,
    currentUser: CurrentUserDto,
    profileImage: FileDto,
  ): Promise<UserResponse> {
    const userDomain = await this.userRepository.getById(userId);
    if (!userDomain) {
      throw new NotFoundException(`User not found with id ${userId}`);
    }
    userDomain.updatedBy = currentUser?.id;
    userDomain.profilePicture = profileImage;
    const result = await this.userRepository.save(userDomain);

    return UserResponse.toResponse(result);
  }
  // userRoles
  async addBulkUserRole(payload: CreateBulkUserRoleCommand) {
    const user = await this.userRepository.getById(payload.userId, [], true);

    if (!user) throw new NotFoundException('User not found');

    const userRoleEntities = payload.roleIds.map((roleId) =>
      CreateUserRoleCommand.toEntity({ userId: payload.userId, roleId }),
    );

    user.userRoles = userRoleEntities;

    const updatedUser = await this.userRepository.save(user);
    return UserResponse.toResponse(updatedUser);
  }
  async addUserRole(payload: CreateUserRoleCommand) {
    const user = await this.userRepository.getById(
      payload.userId,
      ['userRoles'],
      true,
    );
    if (!user) throw new NotFoundException('User not found');
    const userRoleEntity = CreateUserRoleCommand.toEntity(payload);
    user.addUserRole(userRoleEntity);
    const updatedUser = await this.userRepository.save(user);
    return UserResponse.toResponse(updatedUser);
  }
  async updateUserRole(payload: UpdateUserRoleCommand) {
    const user = await this.userRepository.getById(
      payload.userId as string,
      ['userRoles'],
      true,
    );
    if (!user) throw new NotFoundException('User not found');
    let userRole = user.userRoles.find(
      (userRole) => userRole.id === payload.id,
    );
    if (!userRole) throw new NotFoundException('Role not found');
    userRole = { ...userRole, ...payload };
    userRole.updatedBy = payload?.currentUser?.id;
    user.updateUserRole(userRole);
    const updatedUser = await this.userRepository.save(user);
    return UserResponse.toResponse(updatedUser);
  }
  async removeUserRole(payload: RemoveUserRoleCommand) {
    const user = await this.userRepository.getById(
      payload.userId,
      ['userRoles'],
      true,
    );
    if (!user) throw new NotFoundException('User not found');
    const userRole = user.userRoles.find(
      (userRole) => userRole.id === payload.id,
    );
    if (!userRole) throw new NotFoundException('Role not found');
    user.removeUserRole(userRole.id);
    const result = await this.userRepository.save(user);
    return UserResponse.toResponse(result);
  }
}
