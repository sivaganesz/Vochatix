/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-cross-module-repository-imports',
      comment: 'A module should NEVER directly manipulate another module database entities via its repository.',
      severity: 'error',
      from: {
        path: '^apps/server/src/modules/([^/]+)/',
      },
      to: {
        path: '^apps/server/src/modules/([^/]+)/.*\\.repository\\.ts$',
        pathNot: '^apps/server/src/modules/',
      },
    },
    {
      name: 'no-deep-package-imports',
      comment: 'Every package must expose a controlled public API through src/index.ts. Cross-package deep imports are strictly forbidden.',
      severity: 'error',
      from: {
        path: '^apps/',
      },
      to: {
        path: '^packages/([^/]+)/src/(?!index\\.ts)',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    includeOnly: '^(apps|packages)',
    tsPreCompilationDeps: true,
  },
};
