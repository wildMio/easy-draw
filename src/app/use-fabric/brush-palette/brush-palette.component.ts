import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatSliderChange } from '@angular/material/slider';

import { combineLatest, Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';

import { FabricActionService } from '../fabric-action.service';
import { isTextbox } from '../util/type-asset';
import { colors } from 'src/app/component/color-picker/colors';
import { notNil } from 'src/app/utils/general';

type SelectedStatePropName =
  | 'strokeWidth'
  | 'stroke'
  | 'opacity'
  | 'strokeStyle'
  | 'edge'
  | 'fillColor';

@Component({
  selector: 'app-brush-palette',
  templateUrl: './brush-palette.component.html',
  styleUrls: ['./brush-palette.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrushPaletteComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  private readonly selected$ = this.fabricActionService.selectedObjects$;
  private readonly selectedState$ = this.selected$.pipe(
    map((selected) => {
      const state: { [key in SelectedStatePropName]: Set<any> } = {
        strokeWidth: new Set<any>(),
        stroke: new Set<any>(),
        opacity: new Set<any>(),
        strokeStyle: new Set<any>(),
        edge: new Set<any>(),
        fillColor: new Set<any>(),
      };
      selected.forEach((obj) => {
        if (notNil(obj.strokeWidth)) {
          state.strokeWidth.add(obj.strokeWidth);
        }
        if (notNil(obj.stroke)) {
          state.stroke.add(obj.stroke);
        }
        if (notNil(obj.opacity)) {
          state.opacity.add(obj.opacity);
        }
        {
          const [d1, d2] = obj.strokeDashArray ?? [];
          console.log(d1, d2);
          const strokeStyle =
            d1 === undefined
              ? 'line'
              : d2 / d1 === 0.75
              ? 'thin-dash'
              : d2 / d1 === 2.5
              ? 'square-dash'
              : '';
          state.strokeStyle.add(strokeStyle);
        }
        if (notNil(obj.strokeLineCap)) {
          state.edge.add(obj.strokeLineCap === 'round' ? 'round' : 'sharp');
        }
        if (notNil(obj.strokeLineCap)) {
          state.edge.add(obj.strokeLineCap === 'round' ? 'round' : 'sharp');
        }
        if (isTextbox(obj)) {
          {
            state.fillColor.add(obj.textBackgroundColor ?? 'transparent');
          }
        } else {
          {
            state.fillColor.add(obj.fill ?? 'transparent');
          }
        }
      });
      return Object.fromEntries(
        Object.entries(state).map(([key, value]) => [key, [...value.values()]])
      ) as { [key in SelectedStatePropName]: any[] };
    }),
    takeUntil(this.destroy$),
    shareReplay(1)
  );

  readonly color$ = this.pickProp$(
    this.fabricActionService.brushColor$,
    this.selectedState$,
    'stroke'
  );

  readonly fillColor$ = this.pickProp$(
    this.fabricActionService.fillColor$,
    this.selectedState$,
    'fillColor'
  );

  readonly lineWidth$ = this.pickProp$(
    this.fabricActionService.lineWidth$,
    this.selectedState$,
    'strokeWidth'
  );

  readonly lineWidthPlaceholder$ = this.lineWidth$.pipe(
    map((lineWidth) => (notNil(lineWidth) ? '' : '?'))
  );

  readonly opacity$ = this.pickProp$(
    this.fabricActionService.opacity$,
    this.selectedState$,
    'opacity'
  );

  readonly displayOpacity$ = this.opacity$.pipe(
    map((opacity) => (notNil(opacity) ? opacity * 100 : ''))
  );

  readonly opacityPlaceholder$ = this.opacity$.pipe(
    map((opacity) => (notNil(opacity) ? '' : '?'))
  );

  readonly strokeStyle$ = this.pickProp$(
    this.fabricActionService.strokeStyle$,
    this.selectedState$,
    'strokeStyle'
  );

  readonly edge$ = this.pickProp$(
    this.fabricActionService.edge$,
    this.selectedState$,
    'edge'
  );

  readonly backgroundColors = colors.elementBackground;

  constructor(private readonly fabricActionService: FabricActionService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeColor(color: string) {
    this.fabricActionService.changeBrushColor(color);
  }

  changeFillColor(color: string) {
    this.fabricActionService.changeFillColor(color);
  }

  changeLineWidth({ value }: MatSliderChange) {
    this.fabricActionService.changeLineWidth(value ?? 1);
  }

  inputLineWidth(value: string) {
    if (value === '') {
      return;
    }
    this.fabricActionService.changeLineWidth(parseInt(value, 10));
  }

  changeOpacity({ value }: MatSliderChange) {
    this.fabricActionService.changeOpacity((value ?? 100) / 100);
  }

  inputOpacity(value: string) {
    if (value === '') {
      return;
    }
    this.fabricActionService.changeOpacity(parseInt(value, 10) / 100);
  }

  changeStrokeStyle({ value }: MatButtonToggleChange) {
    this.fabricActionService.changeStrokeStyle(value);
  }

  changeEdge({ value }: MatButtonToggleChange) {
    this.fabricActionService.changeEdge(value);
  }

  private pickProp$<T extends Observable<any>, S extends Observable<any>>(
    default$: T,
    selectedState$: S,
    propName: SelectedStatePropName
  ) {
    return combineLatest([default$, selectedState$]).pipe(
      map(([lineWidth, state]) => {
        const len = state[propName].length;
        return len === 1 ? state[propName][0] : len > 1 ? null : lineWidth;
      })
    );
  }
}
