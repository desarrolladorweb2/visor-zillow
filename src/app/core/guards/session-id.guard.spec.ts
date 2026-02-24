import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { sessionIdGuard } from './session-id.guard';

describe('sessionIdGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => sessionIdGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
