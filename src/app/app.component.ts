import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import {
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  Router,
} from '@angular/router';

import { filter, map } from 'rxjs/operators';

import { AppPwaCustomService } from './services/app-pwa-custom.service';
import { AppThemeService } from './services/app-theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = 'easy-draw';

  loadModuleIndicator$ = this.router.events.pipe(
    filter(
      (event) =>
        event instanceof RouteConfigLoadStart ||
        event instanceof RouteConfigLoadEnd
    ),
    map((event) => event instanceof RouteConfigLoadStart)
  );

  constructor(
    @Inject(DOCUMENT) readonly document: Document,
    private readonly renderer: Renderer2,
    private readonly router: Router,
    private readonly matIconRegistry: MatIconRegistry,
    private readonly domSanitizer: DomSanitizer,
    private readonly appPwaCustomService: AppPwaCustomService,
    private readonly appThemeService: AppThemeService
  ) {}

  ngOnInit(): void {
    this.matIconRegistry.addSvgIconResolver((name, namespace) => {
      return namespace === ''
        ? this.domSanitizer.bypassSecurityTrustResourceUrl(
            `/assets/svg/${name}.svg`
          )
        : null;
    });

    this.appPwaCustomService.interceptDefaultInstall();

    this.handleAppTheme();
  }

  handleAppTheme() {
    const body = document.body;
    this.appThemeService.isDarkTheme$.subscribe({
      next: (isDarkTheme) => {
        if (isDarkTheme) {
          this.renderer.addClass(body, 'dark-theme');
        } else {
          this.renderer.removeClass(body, 'dark-theme');
        }
      },
    });
  }
}
