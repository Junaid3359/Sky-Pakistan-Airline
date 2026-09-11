import { Role } from '../models/user.model';

export function isAdmin(role?: string) {
  return role === Role.ADMIN;
}

export function hasRole(role?: string, required?: Role) {
  if (!role) return false;
  if (role === Role.ADMIN) return true;
  return role === required;
}
