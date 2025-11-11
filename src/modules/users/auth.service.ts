import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserResponse } from './usecases/users/user.response';
import { CurrentUserDto } from '@libs/common';
import {
  UserLoginCommand,
  ChangePasswordCommand,
  UpdatePasswordCommand,
} from './auth.commands';
import { UserEntity } from './persistence/users/user.entity';
import { Util } from '@libs/util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async login(loginCommand: UserLoginCommand) {
    const account = await this.userRepository.findOne({
      where: { email: loginCommand.email },
      relations: {
        userRoles: {
          role: true,
        },
      },
    });
    if (!account) {
      throw new BadRequestException(`Incorrect email or password`);
    }

    if (!Util.comparePassword(loginCommand.password, account.password)) {
      throw new BadRequestException(`Incorrect email or password`);
    }
    if (account.isActive === false || !account.isActive) {
      throw new BadRequestException(
        `You have been blocked, please contact us.`,
      );
    }
    const roles: string[] = [];
    const userRoles = account.userRoles;
    if (userRoles) {
      for (const userRole of userRoles) {
        roles.push(userRole?.role?.key);
      }
    }
    const payload: CurrentUserDto = {
      id: account.id,
      email: account?.email,
      name: account?.name,
      gender: account?.gender,
      roles,
      profilePicture: account?.profilePicture,
    };
    const accessToken = Util.GenerateToken(payload, '1h');
    const refreshToken = Util.GenerateRefreshToken(payload);
    return {
      accessToken,
      refreshToken,
      profile: UserResponse.toResponse(account),
    };
  }
  async changePassword(changePasswordCommand: ChangePasswordCommand) {
    const currentUser = changePasswordCommand.currentUser;
    const user = await this.userRepository.findOneBy({
      id: currentUser.id,
    });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    if (
      !Util.comparePassword(
        changePasswordCommand.currentPassword,
        user.password,
      )
    ) {
      throw new BadRequestException(`Incorrect old password`);
    }
    user.password = Util.hashPassword(changePasswordCommand.password);
    const result = await this.userRepository.update(user.id, user);
    return result ? true : false;
  }
  async updatePassword(updatePasswordCommand: UpdatePasswordCommand) {
    const user = await this.userRepository.findOneBy({
      email: updatePasswordCommand.email,
    });
    if (!user) {
      throw new NotFoundException(`User account not found with this email`);
    }
    user.password = Util.hashPassword(updatePasswordCommand.password);
    const result = await this.userRepository.update(user.id, user);
    return result ? true : false;
  }
}
