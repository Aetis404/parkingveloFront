import { TestBed } from '@angular/core/testing';

import { VeloService } from './velo.service';

describe('VeloService', () => {
  let service: VeloService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VeloService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
