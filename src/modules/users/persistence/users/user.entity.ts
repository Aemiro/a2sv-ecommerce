import { Column, Entity, OneToMany } from 'typeorm';
import { Address, CommonEntity, FileDto } from '@libs/common';
import { UserRoleEntity } from './user-role.entity';
@Entity('users')
export class UserEntity extends CommonEntity {
  @Column({ name: 'username' })
  username: string;
  @Column({ name: 'name' })
  name: string;
  @Column({ unique: true })
  email: string;
  @Column()
  password: string;
  @Column({ nullable: true })
  gender: string;
  @Column({ name: 'profile_picture', nullable: true, type: 'jsonb' })
  profilePicture: FileDto;
  @Column({ name: 'is_active', nullable: true, default: true })
  isActive: boolean;
  @Column({ type: 'jsonb', nullable: true })
  address: Address;
  @OneToMany(() => UserRoleEntity, (userRole) => userRole.user, {
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  userRoles: UserRoleEntity[];
  addUserRole(userRole: UserRoleEntity) {
    this.userRoles.push(userRole);
  }
  updateUserRole(userRole: UserRoleEntity) {
    const existIndex = this.userRoles.findIndex(
      (element) => element.id === userRole.id,
    );
    this.userRoles[existIndex] = userRole;
  }
  removeUserRole(id: string) {
    this.userRoles = this.userRoles.filter((element) => element.id !== id);
  }
  updateUserRoles(userRoles: UserRoleEntity[]) {
    this.userRoles = userRoles;
  }
}
