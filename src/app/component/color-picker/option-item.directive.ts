import {
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OptionWrapperDirective } from './option-wrapper.directive';

const indexKeys = [
  '1',
  '2',
  '3',
  '4',
  '5',
  'Q',
  'W',
  'E',
  'R',
  'T',
  'A',
  'S',
  'D',
  'F',
  'G',
  'Z',
  'X',
  'C',
  'V',
  'B',
];

@Directive({
  selector: '[appOptionItem]',
})
export class OptionItemDirective implements OnInit, OnDestroy {
  optionIndex: number | undefined;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly zone: NgZone,
    private readonly renderer: Renderer2,
    private readonly host: ElementRef<HTMLElement>,
    private readonly optionWrapper: OptionWrapperDirective
  ) {}

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      const el = this.host.nativeElement;

      this.optionIndex = this.optionWrapper.addOption(el);

      if (this.optionIndex === undefined) {
        return;
      }

      this.renderer.setAttribute(el, 'data-key', indexKeys[this.optionIndex]);

      fromEvent(el, 'focus')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.optionWrapper.activeChange(this.optionIndex);
          },
        });
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
