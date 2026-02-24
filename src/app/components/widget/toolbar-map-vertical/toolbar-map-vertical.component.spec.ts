import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarMapVerticalComponent } from './toolbar-map-vertical.component';

describe('ToolbarMapVerticalComponent', () => {
  let component: ToolbarMapVerticalComponent;
  let fixture: ComponentFixture<ToolbarMapVerticalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarMapVerticalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolbarMapVerticalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
