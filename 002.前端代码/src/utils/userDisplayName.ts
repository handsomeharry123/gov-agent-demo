import type { User } from '../types/user';

/** 用于界面展示，登录名与账号标识保持不变。 */
export function getUserDisplayName(user?: Pick<User, 'name' | 'displayName'> | null): string {
  const displayName = user?.displayName?.trim();
  if (displayName) return displayName;
  const name = user?.name?.trim();
  if (!name) return '当前用户';
  return name.toLowerCase() === 'admin' ? '系统管理员' : name;
}
