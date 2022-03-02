/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

export enum BammVersion {
  BAMM_2_0_0 = '2.0.0',
}

export class KnownVersion {
  public static fromVersionString(version: string): BammVersion {
    if (BammVersion.BAMM_2_0_0 === version) {
      return BammVersion.BAMM_2_0_0;
    }

    return null;
  }
}
