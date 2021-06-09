import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppThemeService {
  isDarkTheme$ = new BehaviorSubject(false);

  toggleTheme() {
    this.isDarkTheme$.next(!this.isDarkTheme$.getValue());
  }
}
