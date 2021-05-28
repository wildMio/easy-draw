import { Injectable } from '@angular/core';
import { BehaviorSubject, NEVER, Observable } from 'rxjs';
import { FabricActionService } from './fabric-action.service';
import { fabric } from 'fabric';
import { map, switchMap } from 'rxjs/operators';

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
  fabricCanvas$ = new BehaviorSubject<fabric.Canvas | null>(null);

  fabricCanvas: fabric.Canvas | null = null;

  constructor(readonly fabricActionService: FabricActionService) {
    const { deleteSelection$, brushColor$, lineWidth$, mode$, canvasColor$ } =
      fabricActionService;

    this.withFabricCanvas(mode$).subscribe({
      next: ({ fabricCanvas, value }) => {
        fabricCanvas.isDrawingMode = value === 'freeDraw';
        fabricCanvas.selection = value === 'selection';
        fabricCanvas.skipTargetFind = value !== 'selection';
      },
    });

    this.withFabricCanvas(deleteSelection$).subscribe({
      next: ({ fabricCanvas }) => {
        fabricCanvas.remove(...fabricCanvas.getActiveObjects());
        fabricCanvas.discardActiveObject();
      },
    });

    this.withFabricCanvas(brushColor$).subscribe({
      next: ({ fabricCanvas, value }) => {
        const brush = fabricCanvas.freeDrawingBrush;
        brush.color = value;
      },
    });

    this.withFabricCanvas(lineWidth$).subscribe({
      next: ({ fabricCanvas, value }) => {
        fabricCanvas.freeDrawingBrush.width = value;
      },
    });

    this.withFabricCanvas(canvasColor$).subscribe({
      next: ({ fabricCanvas, value }) => {
        fabricCanvas.backgroundColor = value;
        fabricCanvas.requestRenderAll();
      },
    });
  }

  withFabricCanvas<T>(
    obs: Observable<T>
  ): Observable<{ fabricCanvas: fabric.Canvas; value: T }> {
    return this.fabricCanvas$.pipe(
      switchMap((fabricCanvas) =>
        fabricCanvas
          ? obs.pipe(map((value) => ({ fabricCanvas, value })))
          : NEVER
      )
    );
  }

  updateFabricCanvas(fabricCanvas: fabric.Canvas) {
    this.fabricCanvas = fabricCanvas;
    this.fabricCanvas$.next(fabricCanvas);
  }
}
