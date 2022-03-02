/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {Injectable} from '@angular/core';
import isElectron from 'is-electron';

@Injectable({
  providedIn: 'root',
})
export class BrowserService {
  isStartedAsElectronApp() {
    return isElectron();
  }

  getAssetBasePath(): string {
    return this.isStartedAsElectronApp() ? './assets' : '../../../assets';
  }
}
