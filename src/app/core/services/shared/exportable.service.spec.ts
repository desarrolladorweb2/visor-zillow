import { TestBed } from '@angular/core/testing';

import { ExportableService } from './exportable.service';

describe('ExportableService', () => {
  let service: ExportableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
