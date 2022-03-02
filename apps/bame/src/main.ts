/**
 * Copyright (C) 2018 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {applyPolyfills, defineCustomElements} from '@bci-web-core/web-components/loader';
import {AppModule} from './app/app.module';
import {environment} from 'environments/environment';

if (environment.production) {
  enableProdMode();
}

const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule);

applyPolyfills().then(() => defineCustomElements(window).then(() => console.log('Aspect Model Editor started')));

bootstrap().catch(err => console.log(err));
