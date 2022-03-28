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
import { combineLatest, merge, NEVER, Subject } from 'rxjs';
import {
  auditTime,
  debounceTime,
  finalize,
  map,
  mapTo,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { whenResize } from '../utils/resize-observer';
import {
  Edge,
  FabricActionService,
  StrokeStyle,
} from './fabric-action.service';
import { FabricStateService, ModeType } from './fabric-state.service';

interface SelectionCreatedEvent {
  e: MouseEvent;
  selected: fabric.Object[];
}

interface SelectionUpdatedEvent {
  e: MouseEvent;
  selected: fabric.Object[];
  deselected: fabric.Object[];
  updated: fabric.Object;
}

interface SelectionClearedEvent {
  e: MouseEvent;
  deselected: fabric.Object[];
}

interface PathCreatedEvent {
  path: fabric.Path;
}

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

  selectionCreated$ = new Subject<SelectionCreatedEvent>();
  selectionUpdated$ = new Subject<SelectionUpdatedEvent>();
  selectionCleared$ = new Subject<SelectionClearedEvent>();

  selectionCreatedHandler = (e: fabric.IEvent) =>
    this.selectionCreated$.next(e as SelectionCreatedEvent);
  selectionUpdatedHandler = (e: fabric.IEvent) =>
    this.selectionUpdated$.next(e as SelectionUpdatedEvent);
  selectionClearedHandler = (e: fabric.IEvent) =>
    this.selectionCleared$.next(e as SelectionClearedEvent);

  pathCreated$ = new Subject<PathCreatedEvent>();

  pathCreatedHandler = (e: fabric.IEvent) =>
    this.pathCreated$.next(e as any as PathCreatedEvent);

  mouseWheel$ = new Subject<fabric.IEvent>();

  mouseWheelHandler = (e: fabric.IEvent) => this.mouseWheel$.next(e);

  destroy$ = new Subject<void>();

  @Input() parentElement!: HTMLElement;

  @Output() fabricCanvasReady = new EventEmitter<fabric.Canvas>();

  private drawingObject: fabric.Object | null = null;

  constructor(
    private readonly host: ElementRef<HTMLCanvasElement>,
    private readonly zone: NgZone,
    private readonly renderer: Renderer2,
    private readonly fabricStateService: FabricStateService,
    private readonly fabricActionService: FabricActionService
  ) {}

  ngOnInit(): void {
    const canvasEl = this.host.nativeElement;

    this.fabricCanvas = new fabric.Canvas(canvasEl, {
      enableRetinaScaling: true,
    } as fabric.ICanvasOptions);

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
      this.fabricCanvas.on('selection:created', this.selectionCreatedHandler);
      this.fabricCanvas.on('selection:updated', this.selectionUpdatedHandler);
      this.fabricCanvas.on('selection:cleared', this.selectionClearedHandler);
      this.fabricCanvas.on('path:created', this.pathCreatedHandler);
      this.fabricCanvas.on('mouse:wheel', this.mouseWheelHandler);

      this.registerMouseDrawShape();

      this.registerSelectedChange();

      this.registerPathCreated();

      this.registerMouseWheel();
    });

    this.fabricCanvasReady.emit(this.fabricCanvas);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.fabricCanvas.off('mouse:down', this.mousedownHandler);
    this.fabricCanvas.off('mouse:move', this.mousemoveHandler);
    this.fabricCanvas.off('mouse:up', this.mouseupHandler);
    this.fabricCanvas.off('selection:created', this.selectionCreatedHandler);
    this.fabricCanvas.off('selection:updated', this.selectionUpdatedHandler);
    this.fabricCanvas.off('selection:cleared', this.selectionClearedHandler);
    this.fabricCanvas.off('path:created', this.pathCreatedHandler);
    this.fabricCanvas.off('mouse:wheel', this.mouseWheelHandler);
  }

  registerMouseDrawShape() {
    const notShapeMode: Partial<{ [key in ModeType]: true }> = {
      selection: true,
      freeDraw: true,
    };

    const {
      mode$,
      lineWidth$,
      brushColor$,
      opacity$,
      strokeStyle$,
      edge$,
      fillColor$,
    } = this.fabricActionService;

    combineLatest([
      mode$,
      lineWidth$,
      brushColor$,
      opacity$,
      strokeStyle$,
      edge$,
      fillColor$,
    ])
      .pipe(
        // use any because typescript limit. fyi: https://github.com/ReactiveX/rxjs/issues/3601
        auditTime<any>(0),
        switchMap(
          ([
            mode,
            strokeWidth,
            brushColor,
            opacity,
            strokeStyle,
            edge,
            fillColor,
          ]: [ModeType, number, string, number, StrokeStyle, Edge, string]) => {
            if (notShapeMode[mode]) {
              return NEVER;
            }

            if (mode === 'text') {
              let currentTextBox: fabric.Textbox | undefined;
              return this.mousedownEvent$.pipe(
                tap(({ pointer }) => {
                  currentTextBox = this.handleTextMode(
                    pointer,
                    currentTextBox,
                    opacity,
                    brushColor,
                    fillColor
                  );
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
                  pointer,
                  mode,
                  strokeWidth,
                  brushColor,
                  opacity,
                  strokeStyle,
                  edge,
                  fillColor
                );
                return this.mousemoveEvent$.pipe(
                  tap((mousemove) => mousemoveHandler(mousemove)),
                  finalize(() => {
                    if (this.drawingObject) {
                      this.fabricCanvas.remove(this.drawingObject);
                      this.fabricCanvas.add(this.drawingObject);
                      this.drawingObject = null;
                    }
                  }),
                  takeUntil(this.mouseupEvent$)
                );
              })
            );
          }
        ),
        takeUntil(this.destroy$)
      )
      .subscribe({
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        next: () => {},
      });
  }

  generateMousemoveEventHandler(
    pointer: fabric.Point,
    mode: ModeType,
    strokeWidth: number,
    stroke: string,
    opacity: number,
    strokeStyle: StrokeStyle,
    edge: Edge,
    fill: string | undefined
  ): (e: fabric.IEvent) => void {
    const { Rect, Ellipse, Line, Polygon } = fabric;
    const { x: originalX, y: originalY } = pointer;

    let isFirst = true;

    const addObject = (obj: fabric.Object) => {
      this.drawingObject = obj;
      isFirst = false;
      this.fabricCanvas.add(obj);
    };

    const strokeDashArray =
      strokeStyle === 'thin-dash'
        ? [strokeWidth * 4, strokeWidth * 3]
        : strokeStyle === 'square-dash'
        ? [strokeWidth, strokeWidth * 2.5]
        : [];

    const baseConfig = {
      strokeLineCap: edge === 'round' ? 'round' : 'square',
      strokeDashArray,
      padding: strokeWidth,
      borderColor: 'black',
      borderDashArray: [8, 4],
      cornerStrokeColor: 'black',
      borderOpacityWhenMoving: 1,
      opacity,
      strokeLineJoin: edge === 'round' ? edge : undefined,
      fill,
    } as fabric.IObjectOptions;

    switch (mode) {
      case 'square': {
        const rect = new Rect({
          ...baseConfig,
          stroke,
          strokeWidth,
          strokeUniform: true,
          rx: edge === 'round' ? 8 : 0,
          ry: edge === 'round' ? 8 : 0,
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

          isFirst && addObject(rect);

          this.fabricCanvas.requestRenderAll();
        };
      }
      case 'ellipse': {
        const ellipse = new Ellipse({
          ...baseConfig,
          stroke,
          strokeWidth,
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

          isFirst && addObject(ellipse);

          this.fabricCanvas.requestRenderAll();
        };
      }
      case 'line': {
        const line = new Line([], {
          ...baseConfig,
          stroke,
          strokeWidth,
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

          isFirst && addObject(line);

          this.fabricCanvas.requestRenderAll();
        };
      }
      case 'diamond': {
        const diamond = new Polygon(
          [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
          ],
          {
            ...baseConfig,
            stroke,
            strokeWidth,
            strokeUniform: true,
          }
        );

        return ({ pointer }) => {
          if (!pointer) {
            return;
          }

          const { x, y } = pointer;
          const top = Math.min(originalY, y);
          const left = Math.min(originalX, x);
          const width = Math.abs(originalX - x);
          const height = Math.abs(originalY - y);

          diamond.setOptions({ top, left, width, height });

          if (!diamond.points) {
            return;
          }

          diamond.points[0].x = 0;
          diamond.points[0].y = -height / 2;
          diamond.points[1].x = width / 2;
          diamond.points[1].y = 0;
          diamond.points[2].x = 0;
          diamond.points[2].y = height / 2;
          diamond.points[3].x = -width / 2;
          diamond.points[3].y = 0;

          isFirst && addObject(diamond);

          this.fabricCanvas.requestRenderAll();
        };
      }
      default:
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
    }
  }

  handleTextMode(
    pointer: fabric.Point | undefined,
    currentTextBox: fabric.Textbox | undefined,
    opacity: number,
    fill: string | undefined,
    textBackgroundColor: string | undefined
  ): fabric.Textbox | undefined {
    if (!pointer) {
      return;
    }

    currentTextBox?.exitEditing();
    if (currentTextBox && !currentTextBox.text?.length) {
      this.fabricCanvas.remove(currentTextBox);
    }

    const baseConfig = {
      padding: 8,
      borderColor: 'black',
      borderDashArray: [8, 4],
      cornerStrokeColor: 'black',
      borderOpacityWhenMoving: 1,
      fill,
      textBackgroundColor,
    } as fabric.ITextOptions;

    const { Textbox } = fabric;
    const { x: left, y: top } = pointer;
    currentTextBox = new Textbox('', {
      ...baseConfig,
      left,
      top,
      fontSize: 20,
      editable: true,
      strokeUniform: true,
      cursorWidth: 1,
      opacity,
      strokeWidth: 6,
    });

    this.fabricCanvas.add(currentTextBox);
    currentTextBox.enterEditing();
    return currentTextBox;
  }

  registerSelectedChange() {
    const adjustSelectionStyle = (target: fabric.Object, padding: number) => {
      target.cornerStrokeColor = 'black';
      target.borderColor = 'black';
      target.borderDashArray = [8, 4];
      target.padding = padding;
      target.borderOpacityWhenMoving = 1;
    };

    const created$ = this.selectionCreated$.pipe(
      tap(({ selected }) => {
        const padding = Math.max(
          ...selected.map(({ strokeWidth }) => strokeWidth ?? 0)
        );
        selected.forEach((obj) => adjustSelectionStyle(obj, padding));
      })
    );

    const updated$ = this.selectionUpdated$.pipe(
      tap(({ selected }) => {
        const padding = Math.max(
          ...selected.map(({ strokeWidth }) => strokeWidth ?? 0)
        );

        selected.forEach((obj) => adjustSelectionStyle(obj, padding));
      })
    );

    const cleared$ = this.selectionCleared$.pipe(
      mapTo({ selected: [] as fabric.Object[] })
    );

    merge(created$, updated$, cleared$)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ selected }) => {
          console.log(this.fabricCanvas.toJSON());
          selected.forEach((obj) => console.log(obj.toJSON()));
          this.fabricCanvas.loadFromJSON;
          this.fabricActionService.updateSelectedObjects(selected);
        },
      });
  }

  registerPathCreated() {
    this.fabricActionService.opacity$
      .pipe(
        switchMap((opacity) =>
          this.pathCreated$.pipe(map((e) => ({ e, opacity })))
        ),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ({ e: { path }, opacity }) => {
          path.opacity = opacity;
        },
      });
  }

  registerMouseWheel() {
    // this.mouseWheel$.pipe(takeUntil(this.destroy$)).subscribe({
    //   next: (fabricEvent) => {
    //     const e = fabricEvent.e as MouseEvent;
    //     e.shiftKey;
    //     const { x, y } = this.fabricCanvas.getVpCenter();
    //     const point = new fabric.Point(x + 100, y);
    //     // this.fabricCanvas.add(point);
    //     this.fabricCanvas.zoomToPoint({ x: x + 400, y } as any, 1);
    //     this.fabricCanvas.requestRenderAll();
    //   },
    // });
  }
}
