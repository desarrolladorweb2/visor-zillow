import { TestBed } from '@angular/core/testing';

import { GlobalUserParamService } from './global-user-param.service';

describe('GlobalUserParamService', () => {
  let service: GlobalUserParamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalUserParamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
