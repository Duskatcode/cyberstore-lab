import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRoleName, UserStatus } from '../../../generated/prisma/enums';

export class CreateAdminUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(UserRoleName)
  role!: UserRoleName;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
