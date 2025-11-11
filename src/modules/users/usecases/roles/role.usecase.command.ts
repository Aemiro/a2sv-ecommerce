import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RoleResponse } from './role.response';
import { RoleRepository } from '../../persistence/roles/role.repository';
import { CurrentUserDto } from '@libs/common';
import {
  CreateRoleCommand,
  UpdateRoleCommand,
  ArchiveRoleCommand,
} from './role.command';
@Injectable()
export class RoleCommand {
  constructor(private readonly roleRepository: RoleRepository) {}
  async createRole(command: CreateRoleCommand): Promise<RoleResponse> {
    if (await this.roleRepository.getOneBy('name', command.name, [], true)) {
      throw new BadRequestException(`Role already exist with this name`);
    }
    if (await this.roleRepository.getOneBy('key', command.key, [], true)) {
      throw new BadRequestException(`Role already exist with this key`);
    }
    const roleDomain = CreateRoleCommand.toEntity(command);
    roleDomain.createdBy = command?.currentUser?.id;
    roleDomain.updatedBy = command?.currentUser?.id;
    const role = await this.roleRepository.insert(roleDomain);

    return RoleResponse.toResponse(role);
  }
  async updateRole(command: UpdateRoleCommand): Promise<RoleResponse> {
    const role = await this.roleRepository.getById(command.id);
    if (!role) {
      throw new NotFoundException(`Role not found with id ${command.id}`);
    }
    if (role.name !== command.name) {
      const user = await this.roleRepository.getOneBy(
        'name',
        command.name,
        [],
        true,
      );
      if (user) {
        throw new BadRequestException(`Role already exist with this name`);
      }
    }
    if (role.key !== command.key) {
      const user = await this.roleRepository.getOneBy(
        'key',
        command.key,
        [],
        true,
      );
      if (user) {
        throw new BadRequestException(`Role already exist with this key`);
      }
    }
    role.name = command.name ?? role.name;
    role.key = command.key ?? role.key;
    role.description = command.description ?? command.description;
    role.updatedBy = command?.currentUser?.id;
    const result = await this.roleRepository.save(role);
    return RoleResponse.toResponse(result);
  }
  async archiveRole(command: ArchiveRoleCommand): Promise<RoleResponse> {
    const roleDomain = await this.roleRepository.getById(command.id);
    if (!roleDomain) {
      throw new NotFoundException(`Role not found with id ${command.id}`);
    }
    roleDomain.deletedAt = new Date();
    roleDomain.deletedBy = command?.currentUser?.id;
    const result = await this.roleRepository.save(roleDomain);

    return RoleResponse.toResponse(result);
  }
  async restoreRole(
    id: string,
    currentUser: CurrentUserDto,
  ): Promise<RoleResponse> {
    const roleDomain = await this.roleRepository.getById(id, [], true);
    if (!roleDomain) {
      throw new NotFoundException(`Role not found with id ${id}`);
    }
    await this.roleRepository.restore(id);
    roleDomain.deletedAt = undefined;
    return RoleResponse.toResponse(roleDomain);
  }
  async deleteRole(id: string, currentUser: CurrentUserDto): Promise<boolean> {
    const roleDomain = await this.roleRepository.getById(id, [], true);
    if (!roleDomain) {
      throw new NotFoundException(`Role not found with id ${id}`);
    }
    const result = await this.roleRepository.delete(id);
    return result;
  }
}
