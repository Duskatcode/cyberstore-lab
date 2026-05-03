import type { UserRoleName, UserStatus } from '../../../generated/prisma/enums';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRoleName;
  status: UserStatus;
};
