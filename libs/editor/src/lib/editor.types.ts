import {DefaultEnumeration, DefaultEntityValue} from '@bame/meta-model';

export interface ILastSavedModel {
  rdf: string;
  changed: boolean;
  date: Date;
}

export interface IEnumEntityValue {
  enumeration?: DefaultEnumeration;
  entityValue: DefaultEntityValue;
  parentEntityValue?: DefaultEntityValue;
}
