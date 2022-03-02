import {Type, Unit} from '@bame/meta-model';
import {LocaleInterface} from './locale.interface';

export interface BasePropertiesInterface {
  name?: string;
  preferredName?: LocaleInterface[];
  description?: LocaleInterface[];
  see?: string[];
  refines?: string;

  // characteristic
  dataType?: string;

  // property
  optional?: boolean;
  notInPayload?: boolean;
  payloadName?: string;
  exampleValue?: string;

  // constraints
  characteristicType?: Type;
  minValue?: any;
  maxValue?: any;
  lowerBoundDefinition?: any;
  upperBoundDefinition?: any;
  scale?: number;
  integer?: number;
  languageCode?: string;
  value?: any;
  localeCode?: string;

  // nodes
  constraint?: string;

  //units
  commonCode?: string;
  referenceUnit?: Unit;
  symbol?: string;
  conversionFactor?: string;
  numericConversionFactor?: string;
}
