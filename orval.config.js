module.exports = {
  noveAdmin: {
    output: {
      mode: 'split',
      target: 'src/services/generated/index.ts',
      schemas: 'src/services/generated/model',
      client: 'axios',
      override: {
        axios: {
          baseURL: 'http://118.178.234.94:3000',
        },
        operations: {
          '*': {
            tags: ['@generated'],
          },
        },
      },
    },
    input: {
      target: 'http://118.178.234.94:3000/api-json',
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write "src/services/generated/**/*.{ts,tsx}"',
    },
  },
};
