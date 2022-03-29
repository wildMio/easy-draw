import { TestBed } from '@angular/core/testing';

import { FabricIdbService } from './fabric-idb.service';

describe('FabricIdbService', () => {
  let service: FabricIdbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FabricIdbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
