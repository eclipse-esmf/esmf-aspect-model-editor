import {Pipe, PipeTransform} from '@angular/core';

/**
 * The pipe is intended for displaying an element's counter next to its original value
 */
@Pipe({
  name: 'counter',
  standalone: true,
})
export class CounterPipe implements PipeTransform {
  transform(value: string, counter: number | string): string {
    return !value ? value : `${value} (${counter || 0})`;
  }
}
