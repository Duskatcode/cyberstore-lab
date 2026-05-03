import { SetMetadata } from '@nestjs/common';
import type { UserRoleName } from '../../../generated/prisma/enums';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRoleName[]) => SetMetadata(ROLES_KEY, roles);
