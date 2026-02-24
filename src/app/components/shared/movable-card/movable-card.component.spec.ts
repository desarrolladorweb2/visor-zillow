import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovableCardComponent } from './movable-card.component';

describe('MovableCardComponent', () => {
  let component: MovableCardComponent;
  let fixture: ComponentFixture<MovableCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovableCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovableCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
