import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ModeType } from './fabric-state.service';

export type StrokeStyle = 'line' | 'thin-dash' | 'square-dash';

export type Edge = 'round' | 'sharp';

@Injectable({
  providedIn: 'root',
})
export class FabricActionService {
  deleteSelection$ = new Subject<void>();

  canvasColor$ = new BehaviorSubject<string>('transparent');

  brushColor$ = new BehaviorSubject<string>('#000000');

  fillColor$ = new BehaviorSubject<string>('transparent');

  lineWidth$ = new BehaviorSubject<number>(2);

  mode$ = new BehaviorSubject<ModeType>('selection');

  opacity$ = new BehaviorSubject<number>(1);

  selectedObjects$ = new BehaviorSubject<fabric.Object[]>([]);

  strokeStyle$ = new BehaviorSubject<StrokeStyle>('line');

  edge$ = new BehaviorSubject<Edge>('round');

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

  changeFillColor(color: string) {
    this.fillColor$.next(color);
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

  changeEdge(edge: Edge) {
    this.edge$.next(edge);
  }
}
