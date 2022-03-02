### Aspect Model Editor Frontend

UI service for Aspect Model Editor, supports following operations :

* Enables user to create/update aspect models using graphical editor.
* Enables user to Load/Save the Aspect TTL's

### Getting Started

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

#### Build & Package As Electron

```bash
npm run electron:ci
npm run electron-start-win-prod
```

#### Running E2E (Cypress) Test

```bash
npm run cypress
npm run cypress:ci
```

### Reports

* [SonarQube Report](https://bci-dev.de.bosch.com/sonar/dashboard?id=com.bosch.bci.bame:bame-ui)
* [WhiteSource Report](https://app-eu.whitesourcesoftware.com/Wss)
* [FossId Report](https://rb-fossid.de.bosch.com/)

### About

Maintainers
[Michele Santoro](michele.santoro@bosch.com)

Contributors
[Michele Santoro](michele.santoro@bosch.com)
George Moscu Razvan Muresan
