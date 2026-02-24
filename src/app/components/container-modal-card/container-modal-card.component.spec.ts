import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerModalCardComponent } from './container-modal-card.component';

describe('ContainerModalCardComponent', () => {
  let component: ContainerModalCardComponent;
  let fixture: ComponentFixture<ContainerModalCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerModalCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContainerModalCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
