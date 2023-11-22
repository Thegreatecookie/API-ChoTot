import * as dotenv from 'dotenv';
import { Get, SetMetadata } from '@nestjs/common/decorators';
import { Role } from 'src/enums/role.enums';
dotenv.config();
export const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  database_mongo: process.env.MONGO_CONNECTION,
  secret: process.env.SECRET,
  isPublicKey: process.env.IS_PUBLIC_KEY,
  saltOrRounds: parseInt(process.env.SALT_OR_ROUNDS),
  rolesKey: process.env.ROLES_KEY,
};
export const Public = () => SetMetadata(config.isPublicKey, true);
export const Roles = (...roles: Role[]) => SetMetadata(config.rolesKey, roles);
