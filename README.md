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
# Storage: Disk
DISK_STORAGE_ROOT =

# Storage: AWS S3
S3_ENPOINT =
S3_REGION =
S3_ACCESS_KEY =
S3_SECRET_KEY =
S3_BUCKET =

# Storage: Google Cloud
GCLOUD_KEY_FILE =
GCLOUD_BUCKET =
```

### Environment Configuration Overview

| **Name**            | **Description**                                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `DISK_STORAGE_ROOT` | Specifies the root directory for local disk storage. This needs to be set to define where files will be stored.              |
| `S3_ENPOINT`        | The endpoint for your S3 storage service. Must be configured to enable interaction with the S3 bucket.                       |
| `S3_REGION`         | Indicates the AWS region where the S3 bucket is located. Necessary for proper connectivity and access.                       |
| `S3_ACCESS_KEY`     | The access key required for authenticating requests to your S3 storage. Ensure it is kept secure.                            |
| `S3_SECRET_KEY`     | The secret key used alongside the access key to authenticate and authorize access to your S3 bucket. Keep it confidential.   |
| `S3_BUCKET`         | Specifies the name of the S3 bucket where files will be stored. Must be configured for storage functionality.                |
| `GCLOUD_KEY_FILE`   | Points to the JSON key file used for authenticating with Google Cloud services. Critical for accessing Google Cloud Storage. |
| `GCLOUD_BUCKET`     | Defines the name of the Google Cloud Storage bucket to use for storing files.                                                |

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
