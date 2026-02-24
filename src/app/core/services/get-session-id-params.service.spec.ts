import { TestBed } from '@angular/core/testing';

import { GetSessionIdParamsService } from './get-session-id-params.service';

describe('GetSessionIdParamsService', () => {
  let service: GetSessionIdParamsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetSessionIdParamsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
