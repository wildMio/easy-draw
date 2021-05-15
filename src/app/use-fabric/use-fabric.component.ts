import { DOCUMENT } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  AfterViewInit,
  ElementRef,
  Inject,
  NgZone,
  Renderer2,
  VERSION,
  ViewChild,
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';

import { fabric } from 'fabric';

@Component({
  selector: 'app-use-fabric',
  templateUrl: './use-fabric.component.html',
  styleUrls: ['./use-fabric.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UseFabricComponent implements AfterViewInit {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  name = 'Angular ' + VERSION.major;

  fabricCanvas!: fabric.Canvas;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly renderer: Renderer2,
    private readonly zone: NgZone
  ) {}

  ngAfterViewInit(): void {
    const canvasEl = this.canvas.nativeElement;

    this.fabricCanvas = new fabric.Canvas(canvasEl, {
      isDrawingMode: true,
    });

    this.zone.runOutsideAngular(() => {
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(60),
          map((e) => {
            const { innerWidth: width, innerHeight: height } =
              e.target as Window;
            return { width, height };
          }),
          startWith({ width: window.innerWidth, height: window.innerHeight })
        )
        .subscribe({
          next: ({ width, height }) => {
            this.zone.run(() => {
              this.renderer.setAttribute(canvasEl, 'width', String(width));
              this.renderer.setAttribute(canvasEl, 'height', String(height));

              this.fabricCanvas.setWidth(width);
              this.fabricCanvas.setHeight(height);
            });
          },
        });
    });
  }

  clear() {
    this.fabricCanvas.clear();
  }

  changeMode() {
    this.fabricCanvas.isDrawingMode = !this.fabricCanvas.isDrawingMode;
  }

  delete() {
    this.fabricCanvas.remove(this.fabricCanvas.getActiveObject());

    console.log(this.fabricCanvas.getSelectionContext());
    console.log(this.fabricCanvas.getSelectionElement());
  }

  changeColor(e: Event) {
    console.log(e);
    const brush = this.fabricCanvas.freeDrawingBrush;
    brush.color = (e.target as HTMLInputElement).value;
  }

  changeLineWidth(e: Event) {
    const target = e.target as HTMLInputElement;
    this.fabricCanvas.freeDrawingBrush.width = parseInt(target.value, 10) || 1;
  }

  export() {
    console.log(this.fabricCanvas.toJSON());
  }
}
