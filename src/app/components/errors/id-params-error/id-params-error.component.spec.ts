import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdParamsErrorComponent } from './id-params-error.component';

describe('IdParamsErrorComponent', () => {
  let component: IdParamsErrorComponent;
  let fixture: ComponentFixture<IdParamsErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdParamsErrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdParamsErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
