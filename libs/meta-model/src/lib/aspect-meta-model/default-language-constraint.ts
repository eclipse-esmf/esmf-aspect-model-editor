/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {DefaultConstraint} from './default-constraint';

export interface LanguageConstraint {
  languageCode: string;
}

export class DefaultLanguageConstraint extends DefaultConstraint implements LanguageConstraint {
  static createInstance() {
    return new DefaultLanguageConstraint(null, null, 'Constraint', null);
  }

  get className() {
    return 'DefaultLanguageConstraint';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, public languageCode: string) {
    super(metaModelVersion, aspectModelUrn, name);
  }
}
