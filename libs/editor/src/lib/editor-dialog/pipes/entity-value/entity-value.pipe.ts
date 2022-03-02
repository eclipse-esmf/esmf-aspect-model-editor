import {Pipe, PipeTransform} from '@angular/core';
import {DefaultEntityValue} from '@bame/meta-model';

@Pipe({
  name: 'entityValue',
})
export class EntityValuePipe implements PipeTransform {
  transform(value: DefaultEntityValue[], search: string): DefaultEntityValue[] {
    if (!value || value.length === 0) {
      return;
    }
    if (!search) {
      return value;
    }
    return value.filter(val => val.name.includes(search));
  }
}
