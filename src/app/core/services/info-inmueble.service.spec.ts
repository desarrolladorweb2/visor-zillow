import { TestBed } from '@angular/core/testing';

import { InfoInmuebleService } from './info-inmueble.service';

describe('InfoInmuebleService', () => {
  let service: InfoInmuebleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfoInmuebleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
