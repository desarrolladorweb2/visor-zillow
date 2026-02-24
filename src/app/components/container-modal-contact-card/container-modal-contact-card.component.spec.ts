import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerModalContactCardComponent } from './container-modal-contact-card.component';

describe('ContainerModalContactCardComponent', () => {
  let component: ContainerModalContactCardComponent;
  let fixture: ComponentFixture<ContainerModalContactCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerModalContactCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContainerModalContactCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
