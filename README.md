# Finance Backend

This is a small backend project for managing finance records with user roles and basic auth.  
I made it for learning and testing role based access control, APIs, and SQLite together.

It is not a super big project, but it covers the main flow pretty well.

## What it does

- user register and login
- JWT based authentication
- roles like `viewer`, `analyst`, and `admin`
- create and manage finance records
- dashboard style summary and trends
- SQLite database for local setup

## Tech used

- Node.js
- Express
- SQLite
- JWT
- bcryptjs

## Project structure

- `routes/` for API routes
- `services/` for business logic
- `models/` for database queries
- `middleware/` for auth and role checks
- `utils/` for validators, errors, and seeding helpers
- `scripts/` for seed/reset scripts

## How to run

Install dependencies first:

```bash
npm install
```

Start the server:

```bash
npm start
```

For development:

```bash
npm run dev
```

By default it runs on port `3000` if no env is given.

## Testing

Run the test suite with:

```bash
npm test
```

If you want to reset the accounts data and finance data, run:

```bash
npm run reset
```

## Database

This project uses a local SQLite database file:

`finance.db`

The tables are created automatically when the app starts, so you dont need to manually create them.

## Seed data

If you want some sample users and finance records, run:

```bash
node scripts/seed.js
```

If you want to clear the data:

```bash
node scripts/reset.js
```

## Example test accounts

After seeding, you should get accounts like:

- admin
- analyst
- viewer

The exact emails/passwords are printed by the seed script, so that is easier to check there.

## API notes

Main routes are:

- `/api/auth`
- `/api/users`
- `/api/finance`

There is also a health route:

- `/health`

## Small note

This project is mostly for practice and intern assignment purpose, so there are still few things that can be improved later.
