import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { map } from 'rxjs/operators';
import { FabricActionService } from '../fabric-action.service';

@Component({
  selector: 'app-brush-palette',
  templateUrl: './brush-palette.component.html',
  styleUrls: ['./brush-palette.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrushPaletteComponent {
  readonly color$ = this.fabricActionService.brushColor$;

  readonly lineWidth$ = this.fabricActionService.lineWidth$;

  readonly opacity$ = this.fabricActionService.opacity$;

  readonly displayOpacity$ = this.opacity$.pipe(
    map((opacity) => opacity * 100)
  );

  constructor(private readonly fabricActionService: FabricActionService) {}

  changeColor(color: string) {
    this.fabricActionService.changeBrushColor(color);
  }

  changeLineWidth({ value }: MatSliderChange) {
    this.fabricActionService.changeLineWidth(value ?? 1);
  }

  inputLineWidth(value: string) {
    this.fabricActionService.changeLineWidth(parseInt(value, 10));
  }

  changeOpacity({ value }: MatSliderChange) {
    this.fabricActionService.changeOpacity((value ?? 100) / 100);
  }

  inputOpacity(value: string) {
    this.fabricActionService.changeOpacity(parseInt(value, 10) / 100);
  }
}
