# WBS Auth Server Starter

Starter code for authentication/authorization module at WBS Coding School

## Setup

- Fork repo
- Fork repo
- Clone into your computer
- `cd` into working directory
- `npm i` to install dependencies
- create a `.env.development.local` file with variables:
  - `ACCESS_JWT_SECRET`: A secret key for signing access tokens.
  - `DB_NAME`: The db name in your mongo cluster that you share with your data API.
  - `CLIENT_BASE_URL`: The URL of your Frontend, needed for CORS.
  - `MONGO_URI`: The connection string for your MongoDB database.
  - `REFRESH_TOKEN_TTL`: The expiration time for refresh tokens (e.g., `2592000` -> 30 days).
  - `SALT_ROUNDS`: The number of salt rounds for bcrypt.

## Commands

- `npm run dev`: Starts development server, pulling environment variables from `.env.development.local` file
- `npm start`: Builds and starts production server, pulling environment variables from `.env.production.local` file

## Usage

- The code is organised as follows:

```
wbs-ts-travel-journal-api/
|- config/ => To centralise and validate env variables
|- controllers/ => Our controller functions per resource
|- db/ => Database connection with Mongoose
|- middleware/ => custom middleware
|- models/ => Our models per resource
|- routes/ => Our routers per resource
|- schemas/=> Zod schemas for data validations
|- types/ => For additional types
\_ app.ts
```

### API Endpoints

This project has basic controllers the following API endpoints under the `/auth` route:

| Method   | Endpoint    | Description                                                                                                             |
| :------- | :---------- | :---------------------------------------------------------------------------------------------------------------------- |
| `POST`   | `/register` | Creates a new user. Hashes the password before saving. Returns an access token and a refresh token.                     |
| `POST`   | `/login`    | Authenticates a user. If credentials are correct, returns a new access and refresh token.                               |
| `POST`   | `/refresh`  | Takes a valid refresh token (sent via cookies) and returns a new access token and a new refresh token (token rotation). |
| `DELETE` | `/logout`   | Invalidates both the access and refresh tokens.                                                                         |
| `GET`    | `/me`       | Returns the user profile for the currently authenticated user, based on the access token.                               |

## Setup checklist

- Run the development server
- Look through each file to get an overview of the application
  - pay special attention to anything that is unfamiliar to you
- Test each of the endpoints as the currently exist
