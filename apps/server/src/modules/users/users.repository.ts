import { prisma } from '@vochatix/db';

const selectUserFields = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  dob: true,
  bio: true,
  socialLinks: true,
  isOnline: true,
  lastSeenAt: true,
};

export const usersRepository = {
  findAllUsersExcluding(userId: string) {
    return prisma.user.findMany({
      where: { id: { not: userId } },
      select: selectUserFields,
      orderBy: { name: 'asc' },
    });
  },

  searchUsers(query: string, excludeUserId: string) {
    return prisma.user.findMany({
      where: {
        AND: [
          { id: { not: excludeUserId } },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: selectUserFields,
      take: 20,
    });
  },

  findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: selectUserFields,
    });
  },

  updateUser(userId: string, data: any) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: selectUserFields,
    });
  }
};
