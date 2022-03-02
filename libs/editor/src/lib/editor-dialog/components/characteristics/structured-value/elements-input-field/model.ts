import {OverWrittenProperty} from '@bame/meta-model';

export interface StructuredValueVanillaGroups {
  start: number;
  end: number;
  text: string;
  property?: OverWrittenProperty;
  isSplitter?: boolean;
}
