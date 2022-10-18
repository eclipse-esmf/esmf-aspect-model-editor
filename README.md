# Aspect Model Editor

## Table of Contents

- [Introduction](#introduction)
- [Getting help](#getting-help)
- [Getting started](#getting-started)
  - [Setup](#setup)
  - [Install & Run](#install--run)
  - [Run As Electron](#run-as-electron)
  - [Running E2E (Cypress) Test](#running-e2e-cypress-test)
- [Documentation](#documentation)
- [License](#license)

## Introduction

This project includes the Aspect model editor and their documentation.

## Getting help

Are you having trouble with Aspect Model Editor? We want to help!

* Check the [developer documentation](https://openmanufacturingplatform.github.io)
* Check the
  BAMM [specification](https://openmanufacturingplatform.github.io/sds-documentation/bamm-specification/2.0.0/index.html)
* Having issues with the Aspect Model Editor? Open
  a [GitHub issue](https://github.com/OpenManufacturingPlatform/sds-aspect-model-editor/issues).

### Getting started

#### Setup

* Download & Install [Node.js](https://nodejs.org/en/download/)
* To generate Aspect Model documentation, the installation [GraphViz](https://graphviz.org/download) is required.

#### Install & Run

```bash
npm install
npm run start
```

#### Run As Electron

Windows:

```bash
npm run electron-start-win-dev
npm run electron-start-win-prod
```

Mac:

```bash
npm run electron-start-mac-dev
npm run electron-start-mac-prod
```

Unix:

```bash
npm run electron-start-unix-dev
npm run electron-start-unix-prod
```

#### Running E2E (Cypress) Test

```bash
npm run cypress
```

## Documentation

The documentation can be found in the root directory under the path documentation.

## License

SPDX-License-Identifier: MPL-2.0

This program and the accompanying materials are made available under the terms of the
[Mozilla Public License, v. 2.0](LICENSE).

The [Notice file](NOTICE.md) details contained third party materials.

## GraalVm native-image

To build a native image we use GraalVm: [GraalVm](https://github.com/oracle/graal/tree/vm-ce-22.1.0)
