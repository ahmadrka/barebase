<div align="center">

<img src="https://raw.githubusercontent.com/ahmadrka/barestore/main/public/demo/logo-dark.png" width="120" alt="Logo" />

<h1>BareBase API</h1>

<p>
Welcome to BareBase API, a web API for BareStore app that use POS (Point Of Sale) system, built by <a href="https://ahmadrka.com">Ahmadrka</a>, with NestJS framework.
</p>

<a href="https://github.com/ahmadrka/barestore"><img src="https://img.shields.io/badge/BareStore-Frontend_Repo-blue?style=flat&logo=github"></a>
<a href="https://github.com/ahmadrka/barebase"><img src="https://img.shields.io/badge/BareBase-Backend_Repo-red?style=flat&logo=github"></a>
<a href="https://github.com/ahmadrka/barebase/releases"><img src="https://img.shields.io/github/downloads/ahmadrka/barebase/total?style=flat&logo=github&color=brightgreen"></a>
<a href="https://github.com/ahmadrka/barebase/stargazers"><img src="https://img.shields.io/github/stars/ahmadrka/barebase?style=flat&logo=reverbnation&color=yellow"></a>

<br><br>

<h3><code>looking for API documentation? <a href="https://documenter.getpostman.com/view/50216756/2sBXVigpTH">view on Postman</a></code></h3>

</div>

<br>

## Tech Stack

### Core

- [Typescript](https://www.typescriptlang.org/)

- [NestJS](https://nestjs.com/)

- [Fastify](https://www.fastify.io/)

- [PostgreSQL](https://www.postgresql.org/)

- [Prisma](https://www.prisma.io/)

### Dependencies

- [Cloudinary](https://cloudinary.com/)

- [Resend](https://resend.com/)

- [Axios](https://axios-http.com/)

- [Bycrypt](https://www.npmjs.com/package/bcrypt)

- [Passport](https://www.passportjs.org/)

- [Helmet](https://www.npmjs.com/package/@fastify/helmet)

- [Multipart](https://www.npmjs.com/package/@fastify/multipart)

- [Rate Limit](https://www.npmjs.com/package/@fastify/rate-limit)

## Routes

- **Authentication:** manage user identity and tokens.
  - Signup using username, email and password with email verification.
  - Signin using email and password, return access and refresh tokens.
  - OAuth allows users to signin using Google, Microsoft or Facebook.
  - Update Credentials for update email or password.
  - Refresh access token with refresh token.
  - Logout for delete refresh token.

- **Users:** manage user profile and store access.
  - Get user profile.
  - Update user profile.
  - Delete user profile.
  - Join store with invitation or invite token.

- **Stores:** manage store information.
  - Get store information.
  - Update store information.
  - Delete store.

- **Members:** manage store members.
  - Get members.
  - Update member.
  - Delete member.

- **Products:** manage products.
  - Get products.
  - Update product.
  - Delete product.

- **Categories:** manage product categories.
  - Get categories.
  - Update category.
  - Delete category.

- **Transactions:** manage user orders.
  - Get orders.
  - Update order.
  - Delete order.

- **API Service Information:** get API service health and information.

## Database

[![Database](https://raw.githubusercontent.com/ahmadrka/barebase/dev/dbdiagram.svg)](https://dbdiagram.io/d/BareStore-6937f02ae877c63074168e0a)

## Features

### Class Validator & Transformer

- **Class Validator:** validate request data.

- **Class Transformer:** transform request data.

### Authentication & Authorization

- **Login with Email and Password:** allows users to login using email and password.

- **Hashed Passwords:** passwords are stored in hashed form in the database.

- **Email Verification:** automatically sends emails for account creation or password reset.

- **OAuth 2.0 Support:** user can login or signup using their Google, Microsoft or Facebook account.

- **Multi-Tenancy Store:** user can only access and manage if they are members of the store.

- **User and Store Role:** users can only access a feature if they have permission to do so.

### File Upload

- **File Upload:** allows users to upload files.

- **File Format:** supports only image files.

- **File Size:** supports only 5MB files.

### POS (Point Of Sale)

- **Store:**

- **Products:**

- **Staffs:**

- **Transactions:**

## Deployment

### Deployment Demo

\*_use Postman or any other API client to test demo_

<div align="center">

<h4>You can see live demo in here</h4>

<h4>👉 <a href="https://api.barestore.ahmadrka.com">https://api.barestore.ahmadrka.com</a> 👈</h4>

Backend Hosted on <a href="https://koyeb.com">Koyeb</a>
Database Hosted on <a href="https://neon.com">Neon</a>

</div>

### Deployment Setup

1. Make sure you have installed [**Node.js**](https://nodejs.org/) (v18+ recommended).

2. Clone or download [this repository](https://github.com/ahmadrka/barebase).

```bash

git clone https://github.com/ahmadrka/barebase.git

cd barebase

```

3. Download all dependencies modules.

```bash

npm install

```

4. Copy environment example file for reference

```bash

cp .env.example .env

```

5. Now, you can run the server,

```bash

npm run start:dev

```

then, server will running on [http://localhost:3000](http://localhost:3000)

6. Or, you can also run server with production mode.

```bash

npm run build

npm run start:prod

```

Congrats, now you running this BareBase API.
