import { CurrentUserDto } from '@libs/common';
import { Match } from '@libs/decorators/match.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';
export class UserLoginCommand {
  @ApiProperty()
  @IsNotEmpty()
  email: string;
  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
export class ChangePasswordCommand {
  @ApiProperty()
  @IsNotEmpty()
  currentPassword: string;
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(64)
  @Matches(RegExp('^[a-zA-Z0-9\\-]+$'))
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S+$/, {
    message:
      'password too weak, It must be combination of Uppercase, lowercase, special character and numbers',
  })
  password: string;
  @ApiProperty()
  @IsNotEmpty()
  @Match(ChangePasswordCommand, (s) => s.password, {
    message: 'Please confirm your password',
  })
  confirmPassword: string;
  currentUser: CurrentUserDto;
}
export class UpdatePasswordCommand {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S+$/, {
    message:
      'password too weak, It must be combination of Uppercase, lowercase, special character and numbers',
  })
  password: string;
  @ApiProperty()
  @IsNotEmpty()
  @Match(UpdatePasswordCommand, (s) => s.password, {
    message: 'Please confirm your password',
  })
  confirmPassword: string;
  @ApiProperty()
  @IsNotEmpty()
  email: string;
}
