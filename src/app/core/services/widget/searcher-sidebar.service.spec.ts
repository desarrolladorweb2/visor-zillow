import { TestBed } from '@angular/core/testing';

import { SearcherSidebarService } from './searcher-sidebar.service';

describe('SearcherSidebarService', () => {
  let service: SearcherSidebarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearcherSidebarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
