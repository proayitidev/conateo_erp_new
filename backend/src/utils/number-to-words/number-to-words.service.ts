import { Injectable } from '@nestjs/common';
import { ToWords } from 'to-words';

@Injectable()
export class NumberToWordsService {
  private readonly toWords: ToWords;
  constructor() {
    this.toWords = new ToWords({ localeCode: 'fr-FR' });
  }
  convertCurrencyToWords(num: number): string {
    if (typeof num !== 'number' || !Number.isFinite(num)) {
      throw new Error('Input must be a valid finite number.');
    }
    const dec = num.toFixed(2).toString().split('.')[1];

    return (
      this.toWords.convert(num, {
        currency: true,
        ignoreDecimal: true,
        currencyOptions: {
          name: 'gourde',
          plural: 'gourdes',
          symbol: 'HTG',
          fractionalUnit: {
            name: 'centime',
            symbol: '/100',
            plural: 'centimes',
            singular: 'centime',
          },
        },
      }) +
      ' et ' +
      dec +
      '/100'
    );
  }

  convertToWords(num: number): string {
    if (typeof num !== 'number' || !Number.isFinite(num)) {
      throw new Error('Input must be a valid finite number.');
    }
    return this.toWords.convert(num, {
      currency: false,
      ignoreDecimal: true,
    });
  }

  convertToWordsFrench(num: number, isCurrency: boolean = true): string {
    if (isCurrency) return this.convertCurrencyToWords(num);
    else return this.convertToWords(num);
  }
}
