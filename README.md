<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">Nest.js Boilerplate</h1>

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

## Description

The **Nest.js Boilerplate** is a foundational template designed to accelerate the development of scalable and efficient server-side applications. It incorporates commonly used packages, best practices, and modular architecture, making it easy to extend and adapt for various use cases.

This boilerplate is a perfect starting point for building modern, efficient, and maintainable applications with Nest.js.

## Project setup

Copy the example environment configuration file to .env:

```bash
$ cp .env.example .env
```

Install all required Node.js packages:

```bash
$ npm install
```

### Environment

```bash
# Security: API Key
API_KEY_AUTH = true
API_KEY_AUTH_KEY_NAME = X-API-KEY

# Security: Blacklist
BLACKLIST_ENABLE = true
DEVICE_ID_KEY_NAME = X-DEVICE-ID

# Security: JWT
JWT_AUTH = true
JWT_SECRET = NestjsBoilerplate
JWT_EXPIRATION = 4h
```

### Environment Configuration Overview

| **Name**                | **Description**                                                                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `API_KEY_AUTH`          | Enables or disables API key authentication. When set to `true`, requests must include a valid API key.                                        |
| `API_KEY_AUTH_KEY_NAME` | Specifies the header name that will carry the API key for authentication. The default is `X-API-KEY`, which should be used in requests.       |
| `BLACKLIST_ENABLE`      | Activates the blacklist feature. When set to `true`, clients can be blacklisted based on specific criteria.                                   |
| `DEVICE_ID_KEY_NAME`    | Defines the header name used to transmit the Device ID when implementing the blacklist feature. The default is `X-DEVICE-ID`.                 |
| `JWT_AUTH`              | Enables or disables JSON Web Token (JWT) authentication. When `true`, the application will require JWT for secure access.                     |
| `JWT_SECRET`            | Specifies the secret key used to sign and verify JWT tokens, ensuring their integrity and authenticity. This key should be kept confidential. |
| `JWT_EXPIRATION`        | Sets the duration for which JWT tokens remain valid. The format is in duration format, such as `4h` for four hours.                           |

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](./LICENSE).
