import { defineConfig } from '@prisma/cli';

export default defineConfig({
  seed: {
    script: 'prisma/seed.ts',
  },
});
