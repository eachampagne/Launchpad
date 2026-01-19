




### Prisma Setup (first time)

1. npm install

2. Create or update .env file with the correct DATABASE_URL of the form:
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"

3. `npx prisma migrate dev --name init`

4. `npx prisma generate`

### Prisma Setup (migrating schema)

(Still in progress - may be inaccurate)

1. `npx prisma migrate dev`

  You may need to run `npx prisma migrate reset` first to drop and reinitialize the tables. WARNING: ALL DATA WILL BE LOST

  -> Aside: if you need to quickly drop tables to perform the migration, you can log into the psql shell and run:

  ```
  \c launchpad
  DROP TABLE "table";
  ```

  (The quotes are necessary to ensure the case sensitivity works.)

  WARNING: this destroys ALL data in the dropped tables!

2. `npx prisma generate`