import { TestBed } from '@angular/core/testing';

import { AppLayoutBreakpointService } from './app-layout-breakpoint.service';

describe('AppLayoutBreakpointService', () => {
  let service: AppLayoutBreakpointService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppLayoutBreakpointService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
