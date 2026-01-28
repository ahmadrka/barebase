<div align="center">

<a href="https://barestore.ahmadrka.com" target="_blank"><img src="https://raw.githubusercontent.com/ahmadrka/barebase/main/logo.png" width="120" alt="Logo" /></a>

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

## ⚙️ Tech Stack

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

## 📍 Routes

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

## 🗄️ Database

This API use **PostgreSQL** database with **Prisma ORM** to connect with database.

See [Database Diagram](https://dbdiagram.io/d/BareStore-6937f02ae877c63074168e0a) on dbdiagram.io.

<details>
<summary><b>📊 Database Diagram</b> <i>(click to view diagram)</i></summary>
<a href="https://dbdiagram.io/d/BareStore-6937f02ae877c63074168e0a" target="_blank"><img src="https://raw.githubusercontent.com/ahmadrka/barebase/main/dbdiagram.svg" alt="Database"/></a>
</details>

## 📖 Features

### Class Validator & Transformer

- **Class Validator:** validate request data.
- **Class Transformer:** transform request data.

### Authentication & Authorization

- **Authentication:** allows users to login using email and password.
- **User Registration:** allows users to register using username, email and password with email verification.
- **Email Verification:** automatically sends emails for account creation or password reset.
- **OAuth 2.0 Support:** user can login or signup using their Google, Microsoft or Facebook account.

### Security

- **Multi-Tenancy Store:** user can only access and manage if they are members of the store.
- **Role-Based Access Control:** users can only access a feature if they have permission to do so.
- **Rate Limit:** limits the number of requests a user can make in a given time period.
- **Hashed Passwords:** passwords are securely stored in hashed form in the database.

### File Upload

- **File Upload:** allows users to upload files.
- **File Format:** supports only image files.
- **File Size:** supports only 5MB files.

## 📦 Deployment

### Deployment Demo

\*_use Postman or any other API client to test demo_

<div align="center">

<h4>You can see live demo in here</h4>

<!-- <h4>👉 <a href="https://api.barestore.ahmadrka.com">https://api.barestore.ahmadrka.com</a> 👈</h4> -->
<h4>👉 <a href="https://static-helaina-ahmadrika-c5f3f116.koyeb.app">https://static-helaina-ahmadrika-c5f3f116.koyeb.app</a> 👈</h4>

Backend Hosted on <a href="https://koyeb.com">Koyeb</a>,
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

4. Set environment variables, or copy environment example file for reference.

```bash

cp .env.example .env

```

5. Set connection string, make sure you have set the connection string in the .env file.

```bash

npx prisma generate && npx prisma migrate dev

```

6. Now, you can run the server,

```bash

# Run command
npm run start:dev

```

then, server will running on [http://localhost:3001](http://localhost:3001) by default.

7. Or, you can also run server with production mode.

```bash

# Build command
npm install && npx prisma generate && npm run build

# Run command
npx prisma migrate deploy && npm run start:prod

```

Congrats, now you running this BareBase Backend API app.

### Common Issues

<details>

<summary><b>Unable to start the project.</b></summary>

<p>Node.js is not installed or not running, or you have not installed all dependencies modules.</p>

<p><b>Solution: </b>make sure you have installed <a href="https://nodejs.org/">Node.js</a> (v18+ recommended), and run <code>npm install</code> to download all dependencies modules.</p>

</details>
<details>
<summary><b>Project has started but <code>Connection refused</code> error.</b></summary>

<p>You opened the incorrect port or maybe there is another project running on the same port.</p>

<p><b>Solution: </b>check project port in console when you run the project, or set port in <code>.env</code> file. Make sure you open the same port in your frontend or API client.</p>

</details>
<details>
<summary><b>Error <code>P2021: The table ... does not exist.</code></b></summary>

<p>You opened the incorrect port or maybe there is another project running on the same port.</p>

<p><b>Solution: </b>check project port in console when you run the project, or set port in <code>.env</code> file. Make sure you open the same port in your frontend or API client.</p>

</details>
