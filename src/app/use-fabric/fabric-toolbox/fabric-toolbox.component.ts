import { BreakpointObserver } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  Input,
  OnDestroy,
  Renderer2,
  Inject,
} from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { BehaviorSubject, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { colors } from 'src/app/component/color-picker/colors';
import { FabricActionService } from '../fabric-action.service';
import { FabricStateService, ModeType } from '../fabric-state.service';

@Component({
  selector: 'app-fabric-toolbox',
  templateUrl: './fabric-toolbox.component.html',
  styleUrls: ['./fabric-toolbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FabricToolboxComponent implements OnDestroy {
  @Input() fabricCanvas!: fabric.Canvas;

  mode$ = this.fabricActionService.mode$;

  hostEl = this.host.nativeElement;

  canvasColor$ = this.fabricActionService.canvasColor$;

  canvasColors = colors.canvasBackground;

  narrowScreen$ = this.breakObserver
    .observe('(max-width: 700px)')
    .pipe(map((narrowScreen) => narrowScreen.matches));

  wideScreen$ = this.narrowScreen$.pipe(
    map((isNarrowScreen) => !isNarrowScreen)
  );

  showNarrowScreenTools$ = new BehaviorSubject(false);

  showNarrowPalette$ = new BehaviorSubject(false);

  hasSelected$ = this.fabricActionService.selectedObjects$.pipe(
    map((selected) => !!selected.length)
  );

  private readonly destroy$ = new Subject();

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly renderer: Renderer2,
    private readonly host: ElementRef<HTMLElement>,
    private readonly fabricStateService: FabricStateService,
    private readonly fabricActionService: FabricActionService,
    private readonly breakObserver: BreakpointObserver
  ) {
    this.narrowScreen$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (isNarrowScreen) => {
        if (isNarrowScreen) {
          this.renderer.addClass(this.host.nativeElement, 'narrow-toolbox');
        } else {
          this.renderer.removeClass(this.host.nativeElement, 'narrow-toolbox');
        }
      },
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clear() {
    this.fabricCanvas.clear();
  }

  changeMode(toggleChange: MatButtonToggleChange) {
    const value = toggleChange.value as ModeType;
    this.fabricActionService.changeMode(value);
  }

  delete() {
    this.fabricActionService.deleteSelection();
  }

  changeCanvasColor(color: string) {
    this.fabricActionService.changeCanvasColor(color);
  }

  export() {
    console.log(this.fabricCanvas.toJSON());
  }

  toggleNarrowScreenTools() {
    this.showNarrowScreenTools$.next(!this.showNarrowScreenTools$.value);
  }

  toggleNarrowPalette() {
    this.showNarrowPalette$.next(!this.showNarrowPalette$.value);
  }

  toggleTheme() {
    const body = this.document.body;
    this.renderer.addClass(body, 'dark-theme');
  }
}
