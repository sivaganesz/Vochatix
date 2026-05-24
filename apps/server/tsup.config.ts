import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  clean: true,
  noExternal: [
    '@vochatix/auth',
    '@vochatix/config',
    '@vochatix/db',
    '@vochatix/events',
    '@vochatix/logger',
    '@vochatix/schemas',
    '@vochatix/socket-contracts',
    '@vochatix/types',
    '@vochatix/utils'
  ]
});
