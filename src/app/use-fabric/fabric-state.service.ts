import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FabricActionService } from './fabric-action.service';
import { fabric } from 'fabric';

export type ModeType =
  | 'selection'
  | 'freeDraw'
  | 'square'
  | 'diamond'
  | 'ellipse'
  | 'line'
  | 'text';

@Injectable({
  providedIn: 'root',
})
export class FabricStateService {
  mode$ = this.fabricActionService.mode$;

  fabricCanvas: fabric.Canvas | null = null;

  constructor(readonly fabricActionService: FabricActionService) {
    const { deleteSelection$, brushColor$, lineWidth$, mode$, canvasColor$ } =
      fabricActionService;

    mode$.subscribe({
      next: (mode) => {
        if (!this.fabricCanvas) {
          return;
        }
        this.fabricCanvas.isDrawingMode = mode === 'freeDraw';
        this.fabricCanvas.selection = mode === 'selection';
        this.fabricCanvas.skipTargetFind = mode !== 'selection';
      },
    });

    deleteSelection$.subscribe({
      next: () => {
        if (!this.fabricCanvas) {
          return;
        }
        this.fabricCanvas.remove(...this.fabricCanvas.getActiveObjects());
        this.fabricCanvas.discardActiveObject();
      },
    });

    brushColor$.subscribe({
      next: (color) => {
        if (!this.fabricCanvas) {
          return;
        }
        const brush = this.fabricCanvas.freeDrawingBrush;
        brush.color = color;
      },
    });

    lineWidth$.subscribe({
      next: (lineWidth) => {
        if (!this.fabricCanvas) {
          return;
        }
        this.fabricCanvas.freeDrawingBrush.width = lineWidth;
      },
    });

    canvasColor$.subscribe({
      next: (color) => {
        if (!this.fabricCanvas) {
          return;
        }
        this.fabricCanvas.backgroundColor = color;
        this.fabricCanvas.requestRenderAll();
      },
    });
  }

  updateFabricCanvas(fabricCanvas: fabric.Canvas) {
    this.fabricCanvas = fabricCanvas;
  }

  changeMode(mode: ModeType) {
    this.mode$.next(mode);
  }
}
