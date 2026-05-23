import { faker } from '@faker-js/faker';

export function createMockUser(overrides?: any) {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    passwordHash: 'hashed_password',
    avatarUrl: faker.image.avatar(),
    isOnline: false,
    lastSeenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockCall(overrides?: any) {
  return {
    id: faker.string.uuid(),
    conversationId: faker.string.uuid(),
    roomName: faker.string.uuid(),
    callType: 'VIDEO',
    status: 'RINGING',
    startedById: faker.string.uuid(),
    startedAt: new Date(),
    endedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
