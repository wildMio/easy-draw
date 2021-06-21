import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatSliderChange } from '@angular/material/slider';
import { map } from 'rxjs/operators';
import { colors } from 'src/app/component/color-picker/colors';
import { FabricActionService } from '../fabric-action.service';

@Component({
  selector: 'app-brush-palette',
  templateUrl: './brush-palette.component.html',
  styleUrls: ['./brush-palette.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrushPaletteComponent {
  readonly color$ = this.fabricActionService.brushColor$;

  readonly fillColor$ = this.fabricActionService.fillColor$;

  readonly lineWidth$ = this.fabricActionService.lineWidth$;

  readonly opacity$ = this.fabricActionService.opacity$;

  readonly displayOpacity$ = this.opacity$.pipe(
    map((opacity) => opacity * 100)
  );

  readonly strokeStyle$ = this.fabricActionService.strokeStyle$;

  readonly edge$ = this.fabricActionService.edge$;
  readonly backgroundColors = colors.elementBackground;

  constructor(private readonly fabricActionService: FabricActionService) {}

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
}
