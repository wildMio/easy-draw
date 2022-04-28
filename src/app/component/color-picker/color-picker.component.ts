import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  HostBinding,
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { colors } from './colors';

const hexadecimalColorRegExp = /^[\da-f]{3}([\da-f]{3})?$/i;

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPickerComponent {
  @HostBinding('class') class = 'flex items-center';

  @Input() colors: string[] = colors.elementStroke;

  color$ = new BehaviorSubject<string | null>(colors.elementStroke[0]);
  @Input()
  public get color(): string | null {
    return this._color;
  }
  public set color(value: string | null) {
    this._color = value;
    this.color$.next(value);
  }
  private _color: string | null = colors.elementStroke[0];
  colorInput$ = this.color$.pipe(map((color) => color?.replace('#', '') ?? ''));

  @Input() disabled?: boolean;

  @Output() colorSelect = new EventEmitter<string>();

  isOpen = false;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  toggleOverlay() {
    this.isOpen = !this.isOpen;
  }

  closeOverlay(event: MouseEvent, trigger: CdkOverlayOrigin) {
    if (
      (trigger.elementRef.nativeElement as HTMLElement).contains(
        event.target as Node
      )
    ) {
      return;
    }
    this.isOpen = false;
  }

  overlayDetach() {
    this.isOpen = false;
  }

  changeColor(color: string) {
    const checkedColor = hexadecimalColorRegExp.test(color)
      ? `#${color}`
      : color === 'transparent'
      ? color
      : '';
    if (checkedColor) {
      this.colorSelect.emit(checkedColor);
    }
  }
}
