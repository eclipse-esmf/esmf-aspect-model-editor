# Aspect Model Editor

## Table of Contents

- [Download & Installation](#download--installation)
- [Documentation](#documentation)
- [Getting help](#getting-help)
- [Introduction](#)
- [Getting started](#getting-started)
  - [Setup](#setup)
  - [Install & Run](#install--run)
  - [Run As Electron](#run-as-electron)
  - [Running E2E (Cypress) Test](#running-e2e-cypress-test)
- [License](#license)

## Download & Installation

[//]: # (TODO Add something here)

## Documentation

[//]: # (TODO Add something here)

## Getting help

Are you having trouble with Aspect Model Editor? We want to help!

* Check the [developer documentation](https://openmanufacturingplatform.github.io)
* Check the BAMM [specification](https://openmanufacturingplatform.github.io/sds-documentation/bamm-specification/v1.0.0/index.html)
* Having issues with the Aspect Model Editor? Open a [GitHub issue](https://github.com/OpenManufacturingPlatform/sds-aspect-model-editor/issues).

## introduction

[//]: # (TODO Add something here)

### Getting started

#### Setup

* Download & Install [Node.js](https://nodejs.org/en/download/)
* Configure NPM Proxy (Required for downloading Cypress)
    ```bash
    npm config set proxy http://{user}:{password}@{proxy_host}:{proxy_port}
    npm config set https-proxy http://{user}:{password}@{proxy_host}:{proxy_port}
    ```
* Configure NPM Registry
  * Visit [BCI NPM Registry](https://artifactory.boschdevcloud.com) click on "Set Me Up" and follow the specified
    instructions.

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

## License

SPDX-License-Identifier: MPL-2.0

This program and the accompanying materials are made available under the terms of the
[Mozilla Public License, v. 2.0](LICENSE).

The [Notice file](NOTICE.md) details contained third party materials.
