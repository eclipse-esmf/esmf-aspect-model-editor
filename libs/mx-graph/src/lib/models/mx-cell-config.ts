/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

export enum MxAttributeName {
  META_MODEL_PROPERTY = 'metaModelProperty',
  META_MODEL_PROPERTY_LOCALE = 'metaModelPropertyLocale',
}

export class MxCellAttribute {
  constructor(public name: string, public value: string) {}
}

export class MxCellConfig {
  constructor(public label: string, public attributes: Array<MxCellAttribute>) {}
}
