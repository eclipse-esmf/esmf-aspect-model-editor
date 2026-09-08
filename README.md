# Aspect Model Editor

## Table of Contents

- [Introduction](#introduction)
- [Getting help](#getting-help)
- [Getting started](#getting-started-for-developers)
  - [Setup](#setup)
  - [Install & Run](#install--run)
  - [Run As Electron](#run-as-electron)
  - [Running E2E (Cypress) Test](#running-e2e-cypress-test)
- [Documentation](#documentation)
- [License](#license)

## Introduction

This project includes the Aspect Model Editor and its documentation.
As a user, download the Installer from https://github.com/eclipse-esmf/esmf-aspect-model-editor/releases .

## Getting help

Are you having trouble with Aspect Model Editor? We want to help!

- Check the [developer documentation](https://eclipse-esmf.github.io)
- Check the
  SAMM [specification](https://eclipse-esmf.github.io/samm-specification/2.2.0/index.html)
- Having issues with the Aspect Model Editor? Open
  a [GitHub issue](https://github.com/eclipse-esmf/esmf-aspect-model-editor/issues).

### Getting started (for developers)

#### Artifacts to use

You can clone the repositories to run the aspect model editor. Feel free to contribute.
If you want to run the aspect model editor from repositories, please ensure to clone and start the [backend](https://github.com/eclipse-esmf/esmf-aspect-model-editor-backend) first.

#### Setup

- Download & Install [Node.js](https://nodejs.org/en/download/)
- To generate Aspect Model documentation, the installation [GraphViz](https://graphviz.org/download) is required.

#### First steps into the code: [Code Overview](CODE-OVERVIEW.md)

#### Install & Run

```bash
# enter the core directory where the package.json is located
cd core

pnpm install
pnpm run start
```

#### Run As Electron

After running `pnpm start` run one of the following commands:

Windows:

```bash
pnpm run start:win # DEV
pnpm run start:win:prod # PROD
```

Mac:

```bash
pnpm run start:mac # DEV
pnpm run start:mac:prod # PROD
```

Unix:

```bash
pnpm run start:linux # DEV
pnpm run start:linux:prod # PROD
```

#### Running E2E (Cypress) Test

```bash
pnpm run cypress
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
