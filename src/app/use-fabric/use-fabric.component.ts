import { DOCUMENT } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  HostBinding,
  OnDestroy,
  Inject,
} from '@angular/core';

import { fabric } from 'fabric';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppStateService } from '../services/app-state.service';
import { FabricActionService } from './fabric-action.service';
import { FabricStateService } from './fabric-state.service';

@Component({
  selector: 'app-use-fabric',
  templateUrl: './use-fabric.component.html',
  styleUrls: ['./use-fabric.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // providers: [FabricStateService],
})
export class UseFabricComponent implements OnDestroy {
  @HostBinding('class') class = 'block height-100';

  fabricCanvas!: fabric.Canvas;

  hostEl = this.host.nativeElement;

  destroy$ = new Subject();

  showInstallPromotion$ = this.appStateService.showInstallPromotion$;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly host: ElementRef<HTMLElement>,
    private readonly fabricStateService: FabricStateService,
    private readonly fabricActionService: FabricActionService,
    private readonly appStateService: AppStateService
  ) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fabricCanvasReady(fabricCanvas: fabric.Canvas) {
    this.fabricCanvas = fabricCanvas;
    this.fabricStateService.updateFabricCanvas(this.fabricCanvas);

    this.registerGlobalKeyboardEvent();
  }

  registerGlobalKeyboardEvent() {
    fromEvent<KeyboardEvent>(this.document, 'keydown')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (keydown) => {
          if (keydown.key === 'Delete') {
            this.fabricActionService.deleteSelection();
          }
        },
      });
  }

  installPromotion() {
    this.appStateService.installPromotion();
  }
}
