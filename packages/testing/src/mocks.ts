import { vi } from 'vitest';

export function createMockRepository<T extends Record<string, any>>(methods: (keyof T)[]): Record<keyof T, any> {
  const mockRepo = {} as Record<keyof T, any>;
  for (const method of methods) {
    mockRepo[method] = vi.fn();
  }
  return mockRepo;
}
