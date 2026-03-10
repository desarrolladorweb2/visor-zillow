import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleListadoSolicitudesComponent } from './detalle-listado-solicitudes.component';

describe('DetalleListadoSolicitudesComponent', () => {
  let component: DetalleListadoSolicitudesComponent;
  let fixture: ComponentFixture<DetalleListadoSolicitudesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleListadoSolicitudesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleListadoSolicitudesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
