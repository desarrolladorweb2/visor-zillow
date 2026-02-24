import { TestBed } from '@angular/core/testing';

import { ToolbarMapVerticalService } from './toolbar-map-vertical.service';

describe('ToolbarMapVerticalService', () => {
  let service: ToolbarMapVerticalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToolbarMapVerticalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
