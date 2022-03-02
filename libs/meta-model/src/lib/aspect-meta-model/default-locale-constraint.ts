/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {DefaultConstraint} from './default-constraint';

export interface LocaleConstraint {
  localeCode: string;
}

export class DefaultLocaleConstraint extends DefaultConstraint implements LocaleConstraint {
  static createInstance() {
    return new DefaultLocaleConstraint(null, null, 'Constraint', null);
  }

  get className() {
    return 'DefaultLocaleConstraint';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, public localeCode: string) {
    super(metaModelVersion, aspectModelUrn, name);
  }
}
