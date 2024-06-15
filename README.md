## Description

Porch+ Assessment, built with [Nest](https://github.com/nestjs/nest) framework && TypeScript.

## Installation & Setup
- Node v16+
- PostgreSQL

## Installation

```bash
# clone the repository
$ git clone https://github.com/coderboy-exe/porch.git
```

```bash
# Install required dependencies
$ cd porch && npm install
```

## Setup
Open the ```.env.example``` file, provide the following environment variables. Don't forget to provide your valid postgres username and password

```bash
# .env.example
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<dbName>?schema=public"
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USERNAME=
EMAIL_PASSWORD=
```
Rename the file from ```.env.example``` to ```.env```


## Setting up the Database
```bash
# create an initial migration
$ npx prisma migrate dev --name init
```
```bash
# seed the db
$ npm run seedData
```
**NOTE:** I modified two (2) headers in the **"Membership Table"** sheet of the Excel file located at ```/prisma/data/```, changing **First Name and Last Name** to **FirstName and LastName** respectively in order to properly parse their respective columns. Using any other header name ***WILL NOT WORK***

**NB:** I also modified the tables by extracting the User entity from the Membership table and indexing it instead. This was done to promote separation of concerns and allow for better scalability.


## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test
```
All tests should pass

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Uchechukwu Ottah](https://github.com/coderboy-exe)
- Website - [Uchechukwu](https://coderboy.exe.vercel.app)
- Twitter - [@coderboy_exe](https://twitter.com/coderboy_exe)

## License

This project is free to use under the [MIT license](LICENSE).
