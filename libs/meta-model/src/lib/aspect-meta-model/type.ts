/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

export interface Type {
  getUrn(): string;
  isScalar(): boolean;
  isComplex(): boolean;
}
