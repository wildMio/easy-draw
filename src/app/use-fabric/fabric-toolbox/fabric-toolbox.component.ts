import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  Input,
} from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatSliderChange } from '@angular/material/slider';
import { colors } from 'src/app/component/color-picker/colors';
import { FabricActionService } from '../fabric-action.service';
import { FabricStateService, ModeType } from '../fabric-state.service';

@Component({
  selector: 'app-fabric-toolbox',
  templateUrl: './fabric-toolbox.component.html',
  styleUrls: ['./fabric-toolbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FabricToolboxComponent {
  @Input() fabricCanvas!: fabric.Canvas;

  mode$ = this.fabricActionService.mode$;

  hostEl = this.host.nativeElement;

  canvasColor$ = this.fabricActionService.canvasColor$;

  canvasColors = colors.canvasBackground;

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly fabricStateService: FabricStateService,
    private readonly fabricActionService: FabricActionService
  ) {}

  fabricCanvasReady(fabricCanvas: fabric.Canvas) {
    this.fabricCanvas = fabricCanvas;
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

  changeLineWidth({ value }: MatSliderChange) {
    this.fabricCanvas.freeDrawingBrush.width = value || 1;
  }

  export() {
    console.log(this.fabricCanvas.toJSON());
  }
}
