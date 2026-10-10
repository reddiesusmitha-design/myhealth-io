# MyHealthIO — Database Architecture & Migrations

This folder contains the raw SQL schema specification, seed scripts, and architectural notes for PostgreSQL with Prisma ORM.

## Files
- `schema.sql`: Pure PostgreSQL schema DDL with FHIR-aligned mappings and indexing.
- `seed.ts`: Mock clinical dataset seeder providing demo patients, medical documents, lab observations, and medications.

## Setup
In the `backend` directory, Prisma handles automated migrations and client generation:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```
