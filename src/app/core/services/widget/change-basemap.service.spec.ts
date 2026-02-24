import { TestBed } from '@angular/core/testing';

import { ChangeBasemapService } from './change-basemap.service';

describe('ChangeBasemapService', () => {
  let service: ChangeBasemapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChangeBasemapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
