import {DefaultProperty} from './default-property';

export interface OverWrittenPropertyKeys {
  optional?: boolean;
  notInPayload?: boolean;
  payloadName?: string;
}

export interface OverWrittenProperty {
  property: DefaultProperty;
  keys: OverWrittenPropertyKeys;
}
