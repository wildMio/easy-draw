import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ModeType } from './fabric-state.service';

@Injectable({
  providedIn: 'root',
})
export class FabricActionService {
  deleteSelection$ = new Subject();

  canvasColor$ = new BehaviorSubject('transparent');

  brushColor$ = new BehaviorSubject('#000000');

  lineWidth$ = new BehaviorSubject(8);

  mode$ = new BehaviorSubject<ModeType>('selection');

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
}
