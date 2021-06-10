import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ModeType } from './fabric-state.service';

export type StrokeStyle = 'line' | 'thin-dash' | 'square-dash';

@Injectable({
  providedIn: 'root',
})
export class FabricActionService {
  deleteSelection$ = new Subject();

  canvasColor$ = new BehaviorSubject('transparent');

  brushColor$ = new BehaviorSubject('#000');

  lineWidth$ = new BehaviorSubject(2);

  mode$ = new BehaviorSubject<ModeType>('selection');

  opacity$ = new BehaviorSubject(1);

  selectedObjects$ = new BehaviorSubject<fabric.Object[]>([]);

  strokeStyle$ = new BehaviorSubject<StrokeStyle>('line');

  constructor() {}

  deleteSelection() {
    this.deleteSelection$.next();
  }

  changeCanvasColor(color: string) {
    this.canvasColor$.next(color);
  }

  changeBrushColor(color: string) {
    this.brushColor$.next(color);
  }

  changeLineWidth(lineWidth: number) {
    this.lineWidth$.next(lineWidth);
  }

  changeMode(mode: ModeType) {
    this.mode$.next(mode);
  }

  changeOpacity(opacity: number) {
    this.opacity$.next(opacity);
  }

  updateSelectedObjects(selected: fabric.Object[]) {
    this.selectedObjects$.next(selected);
  }

  changeStrokeStyle(style: StrokeStyle) {
    this.strokeStyle$.next(style);
  }
}
