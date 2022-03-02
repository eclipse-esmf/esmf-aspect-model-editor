/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {Injectable} from '@angular/core';

/**
 * This class is used to register actions within the application, like context menu actions
 */
@Injectable({
  providedIn: 'root',
})
export class BindingsService {
  private bindings: {[key: string]: (...args: any[]) => void} = {};

  registerAction(actionName: string, callback: (...args: any[]) => void) {
    this.bindings[actionName] = callback;
  }

  fireAction(actionName: string, ...args: any[]) {
    this.bindings[actionName](...args);
  }
}
