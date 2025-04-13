import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cryptoChange'
})
export class CryptoChangePipe implements PipeTransform {
  transform(value: number, decimalPoints: number = 2): string {
    if (value === null || value === undefined) {
      return '';
    }

    const formatted = value.toFixed(decimalPoints);
    
    if (value > 0) {
      return `+${formatted}%  ▲`;
    } else if (value < 0) {
      return `${formatted}%  ▼`;
    } else {
      return `${formatted}%`;
    }
  }
}
