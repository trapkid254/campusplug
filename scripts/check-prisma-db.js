const fs = require('fs');
const path = require('path');

function exitWith(msg) {
  console.error(msg);
  process.exit(1);
}

const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
if (!fs.existsSync(schemaPath)) {
  exitWith('prisma/schema.prisma not found in repo root.');
}

const schema = fs.readFileSync(schemaPath, 'utf8');
const providerMatch = schema.match(/provider\s*=\s*"([a-z0-9_]+)"/i);
if (!providerMatch) {
  exitWith('Could not detect Prisma provider in prisma/schema.prisma');
}

const provider = providerMatch[1].toLowerCase();
const dbUrl = process.env.DATABASE_URL || '';

if (!dbUrl) {
  console.warn('Warning: DATABASE_URL is not set. Make sure your deployment provides a DATABASE_URL.');
  process.exit(0);
}

function startsWithAny(s, arr) {
  return arr.some((p) => s.startsWith(p));
}

if (provider === 'sqlite') {
  if (!startsWithAny(dbUrl, ['file:', 'file:/'])) {
    exitWith('\nPrisma provider is set to "sqlite" but DATABASE_URL does not start with "file:".\nSet DATABASE_URL to a sqlite file url like `file:./dev.db` for local builds, or change your Prisma provider to match your production DB (e.g. "postgresql").\n\nOn Vercel: set the DATABASE_URL environment variable in Project Settings to a Postgres connection string AND update prisma/schema.prisma provider to "postgresql".\n');
  }
} else if (provider === 'postgresql' || provider === 'postgres') {
  if (!startsWithAny(dbUrl, ['postgresql://', 'postgres://'])) {
    exitWith('\nPrisma provider is set to "postgresql" but DATABASE_URL does not look like a Postgres URL.\nSet DATABASE_URL to your Postgres connection string in the Vercel project settings.\n');
  }
} else {
  // generic check for supported protocols
  if (!dbUrl.includes(':')) {
    exitWith('\nUnrecognized Prisma provider or DATABASE_URL. Please ensure DATABASE_URL is correct.\n');
  }
}

console.log('Prisma provider and DATABASE_URL look consistent.');