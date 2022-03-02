/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

export interface IsDescribed {
  getPreferredName(locale: string): string;

  addPreferredName(locale: string, preferredName: string): void;

  removePreferredName(locale: string): string;

  getDescription(locale: string): string;

  addDescription(locale: string, description: string): void;

  removeDescription(locale: string): string;

  getAllLocalesPreferredNames(): Array<string>;

  getAllLocalesDescriptions(): Array<string>;

  getSeeReferences(): Array<string>;

  addSeeReference(reference: string);

  setSeeReferences(references: Array<string>);
}
