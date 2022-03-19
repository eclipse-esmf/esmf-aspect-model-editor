/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BrowserService {
  isStartedAsElectronApp() {
    if (typeof window !== 'undefined' && typeof window.process === 'object' && (<any>window.process).type === 'renderer') {
      return true;
    }

    if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
      return true;
    }

    return typeof navigator === 'object' && navigator.userAgent.indexOf('Electron') >= 0;
  }

  getAssetBasePath(): string {
    return this.isStartedAsElectronApp() ? './assets' : '../../../assets';
  }
}
