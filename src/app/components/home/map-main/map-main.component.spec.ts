import { TestBed } from '@angular/core/testing';
import { MapMainComponent } from './map-main.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GeometryService } from '../../../core/services/home/map/geometry.service';

describe('MapMainComponent', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MapMainComponent,
        HttpClientTestingModule
      ],
      providers: [GeometryService]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MapMainComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
