// // prisma.config.ts
// import { defineConfig, env } from 'prisma/config';  // or import type { PrismaConfig } from 'prisma'
// import path from 'path';

// export default defineConfig({
//   // optional: point to your schema if not default
//   schema: path.join('prisma', 'schema.prisma'),

//   datasource: {
//     url: env('DATABASE_URL'),
//     // directUrl or shadowDatabaseUrl, if needed
//   },

//   // other config (migrations, views, etc) if you use them
// });



import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  engine: "classic",
  datasource: {
    url: env('DATABASE_URL'),
  },
})