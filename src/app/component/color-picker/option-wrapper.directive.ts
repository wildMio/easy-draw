import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[appOptionWrapper]',
})
export class OptionWrapperDirective implements OnInit, OnDestroy {
  options: HTMLElement[] | null = [];

  activeIndex = -1;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  ngOnInit() {
    const keyOffsets: { [prop: string]: number } = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: 5,
      ArrowUp: -5,
    };
    const navigateCodes: { [prop: string]: number } = {
      Digit1: 0,
      Digit2: 1,
      Digit3: 2,
      Digit4: 3,
      Digit5: 4,
      KeyQ: 5,
      KeyW: 6,
      KeyE: 7,
      KeyR: 8,
      KeyT: 9,
      KeyA: 10,
      KeyS: 11,
      KeyD: 12,
      KeyF: 13,
      KeyG: 14,
      KeyZ: 15,
      KeyX: 16,
      KeyC: 17,
      KeyV: 18,
      KeyB: 19,
    };
    fromEvent<KeyboardEvent>(this.host.nativeElement, 'keydown')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ key, code }) => {
          if (keyOffsets[key] && this.options) {
            let offset = this.activeIndex + keyOffsets[key];
            const optionsLength = this.options.length;
            if (offset >= optionsLength || offset < 0) {
              if (key === 'ArrowLeft' || key === 'ArrowRight') {
                offset += optionsLength;
                offset %= optionsLength;
              } else if (key === 'ArrowUp') {
                const delta = optionsLength % 5;
                offset -= delta;
                if (offset < -5) {
                  offset %= 5;
                }
                offset += optionsLength;
              } else if (key === 'ArrowDown') {
                offset %= 5;
              }
            }

            this.options?.[offset].focus();
          } else if (navigateCodes[code] !== undefined) {
            this.options?.[navigateCodes[code]]?.focus();
            this.options?.[navigateCodes[code]]?.click();
          }
        },
      });
  }

  addOption(element: HTMLElement): number | undefined {
    if (this.options) {
      return this.options.push(element) - 1;
    }
    return;
  }

  activeChange(index: number | undefined) {
    if (index !== undefined) {
      this.activeIndex = index;
    }
  }

  ngOnDestroy() {
    this.options = null;
    this.destroy$.next();
    this.destroy$.complete();
  }
}
