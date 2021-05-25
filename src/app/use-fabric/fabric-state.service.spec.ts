import { TestBed } from '@angular/core/testing';

import { FabricStateService } from './fabric-state.service';

describe('FabricStateService', () => {
  let service: FabricStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FabricStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
