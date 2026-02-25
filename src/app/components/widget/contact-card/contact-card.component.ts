import { ChangeDetectorRef, Component, ComponentRef, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MovableCardComponent } from '../../shared/movable-card/movable-card.component';
import { DialogService } from '../../../core/services/shared/dialog.service';
import { InformationCard } from '../../../interfaces/information-card';
import { BehaviorSubject } from 'rxjs';
import { MapService } from '../../../core/services/home/map/map.service';
import { ContactCardService } from '../../../core/services/widget/contact-card.service';
import { LayersService } from '../../../core/services/home/map/layers.service';
import { InfoInmuebleService } from '../../../core/services/info-inmueble.service';

@Component({
  selector: 'app-contact-card',
  imports: [MovableCardComponent, CommonModule, MatTabsModule],
  templateUrl: './contact-card.component.html',
  styleUrl: './contact-card.component.less',
})
export class ContactCardComponent implements OnInit {
  isVisibleContent = true;
  infoUserCard!: InformationCard;
  paramsUser: string = '';
  mensajeError: string = '';
  infoAsset: any;
  infoTerreno: any;
  infoConstruccion: any;
  posY: any = 230;
  posY_: any = 400;
  selectedOfertaIndex = 0;
  formType: 'oferta' | 'terreno' | 'construccion' | 'asset' | null = null;

  @Input() data$: BehaviorSubject<any> = new BehaviorSubject(null);
  data: any;
  private map!: L.Map;
  dialogRef!: ComponentRef<any>;

  imageList: string[] = [
    //"assets/img/bien_id10.png"
  ];

  currentImage = 0;

  constructor(
    private readonly mapSvc: MapService,
    private readonly dialogService: DialogService,
    private readonly contactCardService: ContactCardService,
    private readonly layersService: LayersService,
    private readonly cd: ChangeDetectorRef,
    private readonly infoInmuebleService: InfoInmuebleService
  ) { }

  ngOnInit(): void {
    this.data = this.data$.value._value;
    console.log('Datos Tabla: ', this.data);
    this.map = this.mapSvc.getMap();
    this.posY += 35 * this.data.counter;
    this.posY_ += 35 * this.data.counter;

    this.getInformationCardAsset();
    this.cd.detectChanges();
  }

  getInformationCardTerreno(): void {
    this.infoTerreno = null;
    this.infoConstruccion = null;
    this.infoAsset = null;
    this.mensajeError = '';
    this.formType = null;

    //console.log('Data Entrada =>', this.data)

    this.contactCardService.getInformacionCardTerreno(this.data).subscribe({
      next: (resp) => {
        if (resp.status === 'error') {
          this.mensajeError = resp.message;
        } else {
          this.infoTerreno = resp.data;
          this.formType = 'terreno';
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching data', err);
        this.cd.detectChanges();
      },
    });
  }

  getInformationCardOferta(): void {
    this.infoTerreno = null;
    this.infoConstruccion = null;
    this.infoAsset = null;
    this.mensajeError = '';
    this.formType = null;

    this.contactCardService.getInformacionCardOferta(this.data).subscribe({
      next: (resp) => {
        if (resp.status === 'error' || !resp.data || Object.keys(resp.data).length === 0) {
          this.mensajeError = resp.message || 'No hay ofertas disponibles.';
          this.formType = null; // ❌ importante
          this.cd.detectChanges();
          return;
        }

        const raw = resp.data || {};
        this.infoTerreno = Object.entries(raw).map(([key, value]: [string, any]) => {
          return { key, ...(value as any) };
        });

        this.selectedOfertaIndex = 0;
        this.formType = 'oferta';
        //console.log('Retorno de Capa Oferta (array) =>', this.infoTerreno);
        this.cd.detectChanges();
      },

      error: (err) => {
        console.error('Error fetching data', err);
        this.mensajeError = 'No hay ofertas disponibles.'; // 🔥 aquí estaba faltando
        this.formType = null; // asegurar que no renderiza tabs
        this.cd.detectChanges();
      },
    });
  }

  getInformationCardConstruccion(): void {
    this.infoTerreno = null;
    this.infoConstruccion = null;
    this.infoAsset = null;
    this.mensajeError = '';
    this.formType = null;

    this.contactCardService.getInformacionCardUnidades(this.data).subscribe({
      next: (resp) => {
        if (resp.status === 'error') {
          this.mensajeError = resp.message;
        } else {
          this.infoConstruccion = resp.data;
          this.formType = 'construccion';
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching data', err);
        this.cd.detectChanges();
      },
    });
  }

  async getInformationCardAsset(): Promise<void> {
    this.infoTerreno = null;
    this.infoConstruccion = null;
    this.infoAsset = null;
    this.mensajeError = '';
    this.formType = null;

    this.contactCardService.getInformacionCardAsset(this.data).subscribe({
      next: async (resp) => {
        if (resp.status === 'error') {
          this.mensajeError = resp.message;
          return;
        }

        this.infoAsset = resp.data;
        this.formType = 'asset';


        const file = `bien_id${this.infoAsset.bien_id}.png`;
        console.log('Imagen Cargada=>', file)
        //const file = this.infoAsset?.imagen || this.infoAsset?.nombre_imagen; "assets/img/bien_id10.png"

        this.imageList = [];

        for (let i = 1; i <= 4; i++) {
          const file = `bien_id${this.infoAsset.bien_id}_${i}.png`;
          const fullPath = `assets/img/${file}`;

          const exists = await this.checkImageExists(fullPath);

          if (exists) {
            this.imageList.push(fullPath);
          }
        }

        this.cd.detectChanges();
      },

      error: (err) => {
        console.error('Error fetching data', err);
        this.cd.detectChanges();
      },
    });
  }

  close(): void {
    const { id, layerName } = this.data;
    const key = `${layerName}-${id}`;

    this.mapSvc.getMap();
    const layer = this.layersService.getLayerObject(layerName, id);
    if (layer) {
      this.map.removeLayer(layer);
    }
    this.layersService.removeLayerId(layerName, id);
    this.infoInmuebleService.selectedPropertyId.set(null); // QUITAR LA ILUMINACIÓN DE LA CARD

    this.dialogService.closeByKey(key);
    this.layersService.decrement();

    const highlight = this.mapSvc.getHighlight();
    if (highlight) {
      this.map.removeLayer(highlight);
      this.mapSvc.setHighlight(null);
    }
  }

  minimize(): void {
    this.isVisibleContent = !this.isVisibleContent;
  }

  isArray(value: any): boolean {
    //console.log('Variable boolena', Array.isArray(value))
    return Array.isArray(value);
  }

  prevOferta() {
    if (!this.infoTerreno || this.infoTerreno.length === 0) return;

    this.selectedOfertaIndex =
      (this.selectedOfertaIndex - 1 + this.infoTerreno.length) %
      this.infoTerreno.length;

    this.cd.detectChanges();
  }

  nextOferta() {
    if (!this.infoTerreno || this.infoTerreno.length === 0) return;

    this.selectedOfertaIndex =
      (this.selectedOfertaIndex + 1) % this.infoTerreno.length;

    this.cd.detectChanges();
  }

  showImages: boolean = false;

  toggleImages() {
    this.showImages = !this.showImages;
  }

  nextImage() {
    this.currentImage = (this.currentImage + 1) % this.imageList.length;
  }

  prevImage() {
    this.currentImage =
      (this.currentImage - 1 + this.imageList.length) % this.imageList.length;
  }

  goToImage(index: number) {
    this.currentImage = index;
  }

  checkImageExists(path: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = path;

      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
  }

}
