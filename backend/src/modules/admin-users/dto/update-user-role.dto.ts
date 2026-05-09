import { IsEnum } from 'class-validator';
import { UserRoleName } from '../../../generated/prisma/enums';

export class UpdateUserRoleDto {
  @IsEnum(UserRoleName)
  role!: UserRoleName;
}
