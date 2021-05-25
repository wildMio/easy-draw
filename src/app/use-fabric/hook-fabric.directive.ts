import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { fabric } from 'fabric';
import { NEVER, Subject } from 'rxjs';
import {
  debounceTime,
  finalize,
  map,
  skip,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { whenResize } from '../utils/resize-observer';
import { FabricStateService, ModeType } from './fabric-state.service';

@Directive({
  selector: '[appHookFabric]',
})
export class HookFabricDirective implements OnInit, OnDestroy {
  fabricCanvas!: fabric.Canvas;

  mousedownEvent$ = new Subject<fabric.IEvent>();
  mousemoveEvent$ = new Subject<fabric.IEvent>();
  mouseupEvent$ = new Subject<fabric.IEvent>();

  mousedownHandler = (e: fabric.IEvent) => this.mousedownEvent$.next(e);
  mousemoveHandler = (e: fabric.IEvent) => this.mousemoveEvent$.next(e);
  mouseupHandler = (e: fabric.IEvent) => this.mouseupEvent$.next(e);

  destroy$ = new Subject();

  @Input() parentElement!: HTMLElement;

  @Output() fabricCanvasReady = new EventEmitter<fabric.Canvas>();

  constructor(
    private readonly host: ElementRef<HTMLCanvasElement>,
    private readonly zone: NgZone,
    private readonly renderer: Renderer2,
    private readonly fabricStateService: FabricStateService
  ) {}

  ngOnInit(): void {
    const canvasEl = this.host.nativeElement;

    this.fabricCanvas = new fabric.Canvas(canvasEl);

    this.zone.runOutsideAngular(() => {
      whenResize(this.parentElement)
        .pipe(
          debounceTime(60),
          map(({ contentRect }) => contentRect),
          startWith({
            width: this.parentElement.offsetWidth,
            height: this.parentElement.offsetHeight,
          }),
          takeUntil(this.destroy$)
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

      this.fabricCanvas.on('mouse:down', this.mousedownHandler);
      this.fabricCanvas.on('mouse:move', this.mousemoveHandler);
      this.fabricCanvas.on('mouse:up', this.mouseupHandler);

      this.registerMouseDrawShape();
    });

    this.fabricCanvasReady.emit(this.fabricCanvas);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.fabricCanvas.off('mouse:down', this.mousedownHandler);
    this.fabricCanvas.off('mouse:move', this.mousemoveHandler);
    this.fabricCanvas.off('mouse:up', this.mouseupHandler);
  }

  registerMouseDrawShape() {
    const notShapeMode: Partial<{ [key in ModeType]: true }> = {
      selection: true,
      freeDraw: true,
    };

    this.fabricStateService.mode$
      .pipe(
        switchMap((mode) => {
          if (notShapeMode[mode]) {
            return NEVER;
          }

          if (mode === 'text') {
            let currentTextBox: fabric.Textbox | undefined;
            return this.mousedownEvent$.pipe(
              tap(({ pointer }) => {
                currentTextBox = this.handleTextMode(pointer, currentTextBox);
              }),
              finalize(() => {
                currentTextBox?.exitEditing();
                if (currentTextBox && !currentTextBox.text?.length) {
                  this.fabricCanvas.remove(currentTextBox);
                }
              })
            );
          }

          return this.mousedownEvent$.pipe(
            switchMap(({ pointer }) => {
              if (!pointer) {
                return NEVER;
              }
              const mousemoveHandler = this.generateMousemoveEventHandler(
                mode,
                pointer
              );
              return this.mousemoveEvent$.pipe(
                tap((mousemove) => mousemoveHandler(mousemove)),
                takeUntil(this.mouseupEvent$)
              );
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {},
      });
  }

  generateMousemoveEventHandler(
    mode: ModeType,
    pointer: fabric.Point
  ): (e: fabric.IEvent) => void {
    const { Rect, Ellipse, Line } = fabric;
    const { x: originalX, y: originalY } = pointer;
    switch (mode) {
      case 'square': {
        const rect = new Rect({
          fill: 'transparent',
          stroke: '#000',
          strokeWidth: 1,
          strokeUniform: true,
        });
        return ({ pointer }) => {
          if (!pointer) {
            return;
          }

          const { x, y } = pointer;
          const top = Math.min(originalY, y);
          const left = Math.min(originalX, x);
          const width = Math.abs(originalX - x);
          const height = Math.abs(originalY - y);

          rect.setOptions({ top, left, width, height });

          this.fabricCanvas.remove(rect);
          this.fabricCanvas.add(rect);
        };
      }
      case 'ellipse': {
        const ellipse = new Ellipse({
          fill: 'transparent',
          stroke: '#000',
          strokeWidth: 1,
          strokeUniform: true,
        });
        return ({ pointer }) => {
          if (!pointer) {
            return;
          }

          const { x, y } = pointer;
          const top = Math.min(originalY, y);
          const left = Math.min(originalX, x);
          const rx = Math.abs(originalX - x) / 2;
          const ry = Math.abs(originalY - y) / 2;

          ellipse.setOptions({ top, left, rx, ry });

          this.fabricCanvas.remove(ellipse);
          this.fabricCanvas.add(ellipse);
        };
      }
      case 'line': {
        const line = new Line([], {
          fill: 'transparent',
          stroke: '#000',
          strokeWidth: 1,
          strokeUniform: true,
        });
        return ({ pointer }) => {
          if (!pointer) {
            return;
          }

          const { x, y } = pointer;

          const changePosition = originalX > x;
          const [x1, x2] = changePosition ? [x, originalX] : [originalX, x];
          const [y1, y2] = changePosition ? [y, originalY] : [originalY, y];

          line.setOptions({ x1, y1, x2, y2 });

          this.fabricCanvas.remove(line);
          this.fabricCanvas.add(line);
        };
      }
      default:
        return () => {};
    }
  }

  handleTextMode(
    pointer: fabric.Point | undefined,
    currentTextBox: fabric.Textbox | undefined
  ): fabric.Textbox | undefined {
    if (!pointer) {
      return;
    }

    currentTextBox?.exitEditing();
    if (currentTextBox && !currentTextBox.text?.length) {
      this.fabricCanvas.remove(currentTextBox);
    }
    const { Textbox } = fabric;
    const { x: left, y: top } = pointer;
    currentTextBox = new Textbox('', {
      left,
      top,
      fontSize: 20,
      editable: true,
      strokeUniform: true,
    });

    this.fabricCanvas.add(currentTextBox);
    currentTextBox.enterEditing();
    return currentTextBox;
  }
}
