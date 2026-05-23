import { usersRepository } from './users.repository';

export async function getAllUsers(currentUserId: string) {
  return usersRepository.findAllUsersExcluding(currentUserId);
}

export async function searchUsers(query: string, currentUserId: string) {
  return usersRepository.searchUsers(query, currentUserId);
}

export async function getUserById(userId: string) {
  return usersRepository.findUserById(userId);
}

export async function updateUser(userId: string, data: { name?: string; avatarUrl?: string | null; dob?: Date | null; bio?: string | null; socialLinks?: any }) {
  return usersRepository.updateUser(userId, data);
}
