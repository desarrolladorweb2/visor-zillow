import { TestBed } from '@angular/core/testing';

import { SidebarShowDataService } from './sidebar-show-data.service';

describe('SidebarShowDataService', () => {
  let service: SidebarShowDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SidebarShowDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
