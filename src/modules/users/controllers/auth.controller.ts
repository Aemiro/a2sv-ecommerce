import * as jwt from 'jsonwebtoken';

import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChangePasswordCommand, UserLoginCommand } from '../auth.commands';
import { CurrentUserDto } from '@libs/common';
import { AuthService } from '../auth.service';
import { Util } from '@libs/util';
import { CurrentUser } from '@libs/decorators/current-user.decorator';
import { JwtAuthGuard } from '@libs/guards/jwt-auth.guard';
import { AllowAnonymous } from '@libs/decorators/allow-anonymous.decorator';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @AllowAnonymous()
  async login(@Body() loginCommand: UserLoginCommand) {
    return this.authService.login(loginCommand);
  }
  @Get('get-user-info')
  @UseGuards(JwtAuthGuard)
  getUserInfo(@CurrentUser() user: CurrentUserDto) {
    return user;
  }
  @Post('refresh')
  @AllowAnonymous()
  getRefreshToken(@Headers() headers: object) {
    if (!headers['x-refresh-token']) {
      throw new ForbiddenException(`Refresh token required`);
    }
    try {
      const refreshToken = headers['x-refresh-token'] as string;
      const p = jwt.verify(
        refreshToken,
        `${process.env.REFRESH_SECRET_TOKEN}`,
      ) as CurrentUserDto;
      return {
        accessToken: Util.GenerateToken(
          {
            id: p.id,
            email: p?.email,
            name: p?.name,
            gender: p?.gender,
            roles: p?.roles ?? [],
            profilePicture: p?.profilePicture,
          },
          '60m',
        ),
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
  @Post('change-password')
  async changePassword(
    @CurrentUser() user: CurrentUserDto,
    @Body() changePasswordCommand: ChangePasswordCommand,
  ) {
    changePasswordCommand.currentUser = user;
    return this.authService.changePassword(changePasswordCommand);
  }
}
