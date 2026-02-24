import { TestBed } from '@angular/core/testing';

import { DownloadSidebarService } from './download-sidebar.service';

describe('DownloadSidebarService', () => {
  let service: DownloadSidebarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DownloadSidebarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
