import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hintForeground',
})
export class HintForegroundPipe implements PipeTransform {
  transform(backgroundColor: string): string {
    return this.isColorDarker(backgroundColor) ? '#fff' : '';
  }

  isColorDarker(color: string): boolean {
    if (!color) {
      return false;
    }

    if (/#[\da-f]{6}/i.test(color)) {
      const { redHex, greenHex, blueHex } = color.match(
        /#(?<redHex>[\da-f]{2})(?<greenHex>[\da-f]{2})(?<blueHex>[\da-f]{2})/i
      )!.groups!;
      const red = parseInt(redHex, 16);
      const green = parseInt(greenHex, 16);
      const blue = parseInt(blueHex, 16);
      // ref article: https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
      return red * 0.299 + green * 0.587 + blue * 0.114 <= 186;
    }
    if (/rgba?\(\d{1,3},\s?\d{1,3},\s?\d{1,3}/i.test(color)) {
      const { redDecimal, greenDecimal, blueDecimal } = color.match(
        /rgba?\((?<redDecimal>\d{1,3}),\s?(?<greenDecimal>\d{1,3}),\s?(?<blueDecimal>\d{1,3})/i
      )!.groups!;
      const red = parseInt(redDecimal, 10);
      const green = parseInt(greenDecimal, 10);
      const blue = parseInt(blueDecimal, 10);
      return red * 0.299 + green * 0.587 + blue * 0.114 <= 186;
    }
    return false;
  }
}
