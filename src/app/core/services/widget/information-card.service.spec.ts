import { TestBed } from '@angular/core/testing';
import { InformationCardService } from './information-card.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('InformationCardService', () => {
  let service: InformationCardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InformationCardService]
    });
    service = TestBed.inject(InformationCardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
