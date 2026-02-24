import { TestBed } from '@angular/core/testing';

import { ContainerModalCardService } from './container-modal-card.service';

describe('ContainerModalCardService', () => {
  let service: ContainerModalCardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContainerModalCardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
