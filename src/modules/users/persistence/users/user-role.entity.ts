import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { RoleEntity } from '../roles/role.entity';
import { CommonEntity } from '@libs/common';

@Entity('user_roles')
export class UserRoleEntity extends CommonEntity {
  @Column({ name: 'user_id' })
  userId: string;
  @Column({ name: 'role_id' })
  roleId: string;
  @ManyToOne(() => UserEntity, (user) => user.userRoles, {
    orphanedRowAction: 'delete',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
  @ManyToOne(() => RoleEntity, (role) => role.userRoles, {
    orphanedRowAction: 'delete',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;
}
