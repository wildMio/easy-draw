import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AppLayoutBreakpointService {
  narrowScreen$ = this.breakObserver
    .observe('(max-width: 700px)')
    .pipe(map((narrowScreen) => narrowScreen.matches));

  wideScreen$ = this.narrowScreen$.pipe(
    map((isNarrowScreen) => !isNarrowScreen)
  );

  constructor(private readonly breakObserver: BreakpointObserver) {}
}
