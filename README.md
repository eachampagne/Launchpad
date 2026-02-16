




### Prisma Setup (first time)

1. `npm install`

2. Create or update .env file with the correct `DATABASE_URL` of the form:
`DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"`

    Things to change:

    * `username` to your username
    * `password` to your password
    * We are using port `5432` for now, but that could change in the future
    * `mydb` to `launchpad`

3. `npx prisma migrate dev --name init`

4. `npx prisma generate`

5. `npx prisma db seed`

### Prisma Setup (migrating schema)

(Still in progress - may be inaccurate)

1. Migrate your database. Options:

    1. `npx prisma migrate reset`

        WARNING: ALL DATA WILL BE LOST! This drops everything to start from a clean slate. It's fine if none of the data in your database matters much. In this case, perform the seed step (step 3) to get up and running again quickly.

    2. `npx prisma migrate dev`

        I think this is the way to maintain your data and update it to conform with the new schemas. I don't know how to do it yet, which is why I've only been using the reset option.

2. `npx prisma generate`

3. `npx prisma db seed` if the database was reset

### Testing with Playwright

TODO

Make sure the server is running when you run the tests!

I don't know if ultimately we need to switch to the deployed URL or how this will work with GitHub Actions.