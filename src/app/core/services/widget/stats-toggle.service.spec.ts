import { TestBed } from '@angular/core/testing';

import { StatsToggleService } from './stats-toggle.service';

describe('StatsToggleService', () => {
  let service: StatsToggleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatsToggleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
