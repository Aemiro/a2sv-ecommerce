import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCommand } from './usecases/users/user.usecase.command';
import { UserRepository } from './persistence/users/user.repository';
import { UserController } from './controllers/user.controller';
import { Module } from '@nestjs/common';
import { UserQuery } from './usecases/users/user.usecase.query';
import { AuthService } from './auth.service';
import { AuthController } from './controllers/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserEntity } from './persistence/users/user.entity';
import { MinioService } from '@infrastructure/minio.service';
import { RoleController } from './controllers/role.controller';
import { UserRoleEntity } from './persistence/users/user-role.entity';
import { RoleEntity } from './persistence/roles/role.entity';
import { RoleRepository } from './persistence/roles/role.repository';
import { RoleCommand } from './usecases/roles/role.usecase.command';
import { RoleQuery } from './usecases/roles/role.usecase.query';

@Module({
  controllers: [UserController, AuthController, RoleController],
  imports: [
    TypeOrmModule.forFeature([UserEntity, RoleEntity, UserRoleEntity]),
    PassportModule,
  ],
  providers: [
    UserRepository,
    UserCommand,
    UserQuery,
    RoleRepository,
    RoleCommand,
    RoleQuery,
    AuthService,
    JwtStrategy,
    MinioService,
  ],
})
export class UserModule {}
