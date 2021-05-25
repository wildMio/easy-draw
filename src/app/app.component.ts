import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import {
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  Router,
} from '@angular/router';
import { filter, map } from 'rxjs/operators';

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
    private readonly router: Router,
    private readonly matIconRegistry: MatIconRegistry,
    private readonly domSanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.matIconRegistry.addSvgIconResolver((name, namespace) => {
      return namespace === ''
        ? this.domSanitizer.bypassSecurityTrustResourceUrl(
            `/assets/svg/${name}.svg`
          )
        : null;
    });
  }
}
