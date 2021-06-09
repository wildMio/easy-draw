import { TestBed } from '@angular/core/testing';

import { AppPwaCustomService } from './app-pwa-custom.service';

describe('AppPwaCustomService', () => {
  let service: AppPwaCustomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppPwaCustomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
