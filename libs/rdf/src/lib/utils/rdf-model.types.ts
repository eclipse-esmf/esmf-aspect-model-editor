import {Quad_Object} from 'n3';

export interface InstantiatorListElement {
  blankNode?: boolean;
  quad: Quad_Object;
  optional?: Quad_Object;
  notInPayload?: Quad_Object;
  payloadName?: Quad_Object;
}
