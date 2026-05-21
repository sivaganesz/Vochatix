import { prisma } from '../../prisma/prisma.service';

export async function getAllUsers(currentUserId: string) {
  return prisma.user.findMany({
    where: { id: { not: currentUserId } },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      dob: true,
      bio: true,
      socialLinks: true,
      isOnline: true,
      lastSeenAt: true,
    },
    orderBy: { name: 'asc' },
  });
}

export async function searchUsers(query: string, currentUserId: string) {
  return prisma.user.findMany({
    where: {
      AND: [
        { id: { not: currentUserId } },
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      dob: true,
      bio: true,
      socialLinks: true,
      isOnline: true,
      lastSeenAt: true,
    },
    take: 20,
  });
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      dob: true,
      bio: true,
      socialLinks: true,
      isOnline: true,
      lastSeenAt: true,
    },
  });
}

export async function updateUser(userId: string, data: { name?: string; avatarUrl?: string | null; dob?: Date | null; bio?: string | null; socialLinks?: any }) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      dob: true,
      bio: true,
      socialLinks: true,
      isOnline: true,
      lastSeenAt: true,
    },
  });
}
