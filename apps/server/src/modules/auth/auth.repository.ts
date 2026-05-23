import { prisma } from '@vochatix/db';

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  createUser(data: { name: string; email: string; passwordHash: string }) {
    return prisma.user.create({
      data,
      select: { id: true, name: true, email: true, avatarUrl: true },
    });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
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
        createdAt: true,
      },
    });
  }
};
