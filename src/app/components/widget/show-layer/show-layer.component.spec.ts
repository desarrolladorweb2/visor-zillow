import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowLayerComponent } from './show-layer.component';

describe('ShowLayerComponent', () => {
  let component: ShowLayerComponent;
  let fixture: ComponentFixture<ShowLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowLayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
