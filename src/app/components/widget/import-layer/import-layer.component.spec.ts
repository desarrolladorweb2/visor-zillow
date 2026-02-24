import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ImportLayerComponent } from './import-layer.component';
import { MapService } from '../../../core/services/home/map/map.service';
import { ChangeDetectorRef } from '@angular/core';

import * as shp from 'shpjs';
import * as JSZip from 'jszip';
import * as L from 'leaflet';

// ---------- MOCKS ----------

// Mock Leaflet
const mockGeoJsonLayer = {
  addTo: jasmine.createSpy('addTo').and.returnValue(true),
  getBounds: () => ({
    isValid: () => true
  })
};

const mockLeaflet = {
  geoJSON: jasmine.createSpy('geoJSON').and.returnValue(mockGeoJsonLayer),
  map: jasmine.createSpy('map')
};

describe('ImportLayerComponent', () => {
  let component: ImportLayerComponent;
  let fixture: ComponentFixture<ImportLayerComponent>;
  let mapServiceMock: any;

  beforeEach(async () => {

    // Mock MapService
    mapServiceMock = {
      getMap: jasmine.createSpy('getMap').and.returnValue({
        removeLayer: jasmine.createSpy('removeLayer'),
        fitBounds: jasmine.createSpy('fitBounds'),
        addLayer: jasmine.createSpy('addLayer')
      }),
      getLayerControl: jasmine.createSpy('getLayerControl').and.returnValue({
        addOverlay: jasmine.createSpy('addOverlay')
      }),
      registerLayer: jasmine.createSpy('registerLayer'),
      setLayerState: jasmine.createSpy('setLayerState')
    };

    // Mock shp.parseZip
    spyOn(shp, 'parseZip').and.returnValue(
      Promise.resolve({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, 0]
          },
          properties: {}
        }]
      })
    );

    // Mock JSZip.loadAsync
    spyOn(JSZip, 'loadAsync').and.callFake(async () => {
      return {
        files: {
          'file.shp': { async: async () => new ArrayBuffer(10), dir: false },
          'file.shx': { async: async () => new ArrayBuffer(10), dir: false },
          'file.dbf': { async: async () => new ArrayBuffer(10), dir: false },
          'file.prj': { async: async () => 'EPSG:4326', dir: false }
        }
      } as any;
    });

    // Mock Leaflet
    spyOn(L, 'geoJSON').and.callFake(() => mockGeoJsonLayer as any);

    await TestBed.configureTestingModule({
      imports: [ImportLayerComponent],
      providers: [
        { provide: MapService, useValue: mapServiceMock },
        ChangeDetectorRef,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // --------------------------------------  
  //              TESTS  
  // --------------------------------------

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar el mapa en ngOnInit', () => {
    component.ngOnInit();
    expect(mapServiceMock.getMap).toHaveBeenCalled();
  });

  it('debe manejar onFileSelected con archivo NO zip', () => {
    const mockFile = new File(['abc'], 'test.json');
    const event = { target: { files: [mockFile] } } as any;

    spyOn<any>(component, 'processFile').and.callFake(() => {});

    component.onFileSelected(event);

    expect(component['processFile']).toHaveBeenCalled();
  });

  it('debe manejar onFileSelected con archivo ZIP válido', fakeAsync(() => {
    const mockFile = new File(['abc'], 'test.zip');
    const event = { target: { files: [mockFile] } } as any;

    spyOn<any>(component, 'isValidShapefileZip').and.returnValue(Promise.resolve(true));
    spyOn<any>(component, 'processFile').and.callFake(() => {});

    component.onFileSelected(event);
    tick();

    expect(component['processFile']).toHaveBeenCalled();
  }));

  it('debe activar bandera flagNoCompatible si el ZIP es inválido', fakeAsync(() => {
    const mockFile = new File(['abc'], 'bad.zip');
    const event = { target: { files: [mockFile] } } as any;

    spyOn<any>(component, 'isValidShapefileZip').and.returnValue(Promise.resolve(false));

    component.onFileSelected(event);
    tick();

    expect(component.flagNoCompatible).toBeTrue();
  }));

  it('onDrop debe llamar processFile cuando el archivo es válido', fakeAsync(() => {
    const mockFile = new File(['abc'], 'test.zip');
    const event = { preventDefault: () => {}, dataTransfer: { files: [mockFile] } } as any;

    spyOn<any>(component, 'isValidShapefileZip').and.returnValue(Promise.resolve(true));
    spyOn<any>(component, 'processFile');

    component.onDrop(event);
    tick();

    expect(component['processFile']).toHaveBeenCalled();
  }));

  it('onDragOver debe activar isDragOver', () => {
    const event = { preventDefault: () => {} } as any;
    component.fileName = null;
    component.onDragOver(event);
    expect(component.isDragOver).toBeTrue();
  });

  it('onDragLeave debe desactivar isDragOver', () => {
    const event = { preventDefault: () => {} } as any;
    component.fileName = null;
    component.onDragLeave(event);
    expect(component.isDragOver).toBeFalse();
  });

  it('addLayer debe agregar capa al mapa cuando el geojson es válido', () => {
    const geojson = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0]
        },
        properties: {}
      }]
    };

    component.map = mapServiceMock.getMap();
    component['addLayer'](geojson);

    expect(L.geoJSON).toHaveBeenCalled();
    expect(component.layer).toBeTruthy();
  });

  it('onClear debe limpiar capa y resetear variables', () => {
    component.layer = mockGeoJsonLayer as any;
    component.map = mapServiceMock.getMap();

    component.onClear();

    expect(component.layer).toBeNull();
    expect(component.fileName).toBeNull();
    expect(component.geojson).toBeNull();
  });

  it('onCancel debe resetear valores', () => {
    component.fileName = 'test';
    component.geojson = { a: 1 };

    component.onCancel();

    expect(component.fileName).toBeNull();
    expect(component.geojson).toBeNull();
  });

  it('onSave debe registrar capa y limpiar estado', () => {
    component.layer = mockGeoJsonLayer as any;
    component.fileName = 'layer.shp';

    component.onSave();

    expect(mapServiceMock.registerLayer).toHaveBeenCalled();
    expect(mapServiceMock.setLayerState).toHaveBeenCalled();
    expect(component.layer).toBeNull();
  });

  it('isValidShapefileZip debe retornar true para ZIP válido', fakeAsync(async () => {
    const file = new File(['abc'], 'good.zip');
    const result = await component['isValidShapefileZip'](file);
    expect(result).toBeTrue();
  }));
});

