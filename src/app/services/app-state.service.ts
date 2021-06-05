import { Injectable } from '@angular/core';
import { BehaviorSubject, from, fromEvent } from 'rxjs';
import { map, switchMapTo, take } from 'rxjs/operators';
import { BeforeInstallPromptEvent } from './before-install-prompt-event.model';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  deferredPrompt$ = new BehaviorSubject<BeforeInstallPromptEvent | null>(null);

  showInstallPromotion$ = this.deferredPrompt$.pipe(map((prompt) => !!prompt));

  constructor() {
    fromEvent<BeforeInstallPromptEvent>(
      window,
      'beforeinstallprompt'
    ).subscribe({
      next: (event) => {
        event.preventDefault();

        this.deferredPrompt$.next(event);
      },
    });

    fromEvent(window, 'appinstalled').subscribe({
      next: () => {
        this.deferredPrompt$.next(null);
      },
    });

    fromEvent(
      window.matchMedia('(display-mode: standalone)'),
      'change'
    ).subscribe({
      next: (evt) => {
        let displayMode = 'browser';
        if ((evt as any).matches) {
          displayMode = 'standalone';
        }
        // Log display mode change to analytics
        console.log('DISPLAY_MODE_CHANGED', displayMode);
      },
    });
  }

  installPromotion() {
    const deferredPrompt = this.deferredPrompt$.getValue();
    if (!deferredPrompt) {
      return;
    }
    from(deferredPrompt?.prompt())
      .pipe(switchMapTo(from(deferredPrompt.userChoice)), take(1))
      .subscribe({
        next: () => {
          this.deferredPrompt$.next(null);
        },
      });
  }

  getPWADisplayMode() {
    const isStandalone = window.matchMedia(
      '(display-mode: standalone)'
    ).matches;
    if (document.referrer.startsWith('android-app://')) {
      return 'twa';
    } else if ((navigator as any).standalone || isStandalone) {
      return 'standalone';
    }
    return 'browser';
  }
}
