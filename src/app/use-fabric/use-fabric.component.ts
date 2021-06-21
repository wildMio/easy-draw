import { DOCUMENT } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  HostBinding,
  OnDestroy,
  Inject,
} from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

import { fabric } from 'fabric';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppLayoutBreakpointService } from '../services/app-layout-breakpoint.service';
import { AppPwaCustomService } from '../services/app-pwa-custom.service';
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

  destroy$ = new Subject<void>();

  showInstallPromotion$ = this.appPwaCustomService.showInstallPromotion$;

  narrowScreen$ = this.appLayoutBreakpointService.narrowScreen$;

  swUpdateAvailable$ = this.swUpdate.available;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly host: ElementRef<HTMLElement>,
    private readonly fabricStateService: FabricStateService,
    private readonly fabricActionService: FabricActionService,
    private readonly appLayoutBreakpointService: AppLayoutBreakpointService,
    private readonly appPwaCustomService: AppPwaCustomService,
    private readonly swUpdate: SwUpdate
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
    this.appPwaCustomService.installPromotion();
  }

  reloadPage() {
    this.swUpdate.activateUpdate().then(() => this.document.location.reload());
  }
}
