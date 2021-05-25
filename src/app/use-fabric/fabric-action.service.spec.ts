import { TestBed } from '@angular/core/testing';

import { FabricActionService } from './fabric-action.service';

describe('FabricActionService', () => {
  let service: FabricActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FabricActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
