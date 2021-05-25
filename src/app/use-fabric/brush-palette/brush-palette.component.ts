import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
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
}
