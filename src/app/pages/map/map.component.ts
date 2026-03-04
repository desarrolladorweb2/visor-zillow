import { Component, inject, OnInit, signal, ViewChild, HostListener, ElementRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/home/navbar/navbar.component';
import { SidebarComponent } from '../../components/home/sidebar/sidebar.component';
import { FooterComponent } from '../../components/home/footer/footer.component';
import { MapMainComponent } from '../../components/home/map-main/map-main.component';
import { GeometryService } from '../../core/services/home/map/geometry.service';
import { ContainerCardComponent } from "../../components/container-card/container-card.component";
import { CommonModule } from '@angular/common';
import { ContainerModalCardComponent } from "../../components/container-modal-card/container-modal-card.component";
import { ContainerModalContactCardComponent } from "../../components/container-modal-contact-card/container-modal-contact-card.component";
import { InfoInmuebleService } from '../../core/services/info-inmueble.service';

@Component({
  selector: 'app-map',
  imports: [
    CommonModule,
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    RouterOutlet,
    MapMainComponent,
    ContainerCardComponent,
    ContainerModalCardComponent,
    ContainerModalContactCardComponent
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.less',
})
export class MapComponent implements OnInit {

  id?: string;
  isLoading = signal(false);
  isPriceDropdownOpen = signal(false);

  filters = signal({
    precioMin: null as number | null,
    precioMax: null as number | null,
    tipo_bien_id: null,
    tipo_predio_id: null,
    clasificacion_id: null,
    departamento_id: null,
    municipio_id: null
  });

  tempPrecioMin = signal<number | null>(null);
  tempPrecioMax = signal<number | null>(null);

  property = signal<any>(null);
  filteredProperties = signal<any[]>([]);
  totalCount = signal(0);

  minPriceLimit = signal(0);
  maxPriceLimit = signal(100);

  histogramBars = [5, 15, 30, 60, 45, 80, 100, 90, 50, 40, 20, 10, 5];

  @ViewChild('mapRef') mapComponent!: MapMainComponent;

  private readonly infoInmuebleService = inject(InfoInmuebleService);
  private readonly geometryService = inject(GeometryService);
  private readonly eRef = inject(ElementRef);

  selectedPropertyId = this.infoInmuebleService.selectedPropertyId;

  filterOptions = {
    tiposBien: [] as { id: number, label: string }[],
    tiposPredio: [] as { id: number, label: string }[],
    clasificaciones: [] as { id: number, label: string }[],
    departamentos: [] as { id: number, label: string }[],
    municipios: [] as { id: number, label: string }[]
  };

  // --- LÓGICA DEL DROPDOWN ---

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.isPriceDropdownOpen()) {
      if (!this.eRef.nativeElement.contains(event.target)) {
        this.isPriceDropdownOpen.set(false);
      }
    }
  }

  togglePriceDropdown(event: Event) {
    event.stopPropagation();
    const willOpen = !this.isPriceDropdownOpen();
    this.isPriceDropdownOpen.set(willOpen);

    if (willOpen) {
      this.tempPrecioMin.set(this.filters().precioMin);
      this.tempPrecioMax.set(this.filters().precioMax);
    }
  }

  // --- MAGIA MATEMÁTICA: ESCALA LOGARÍTMICA ---

  get minLog() { return Math.log10(Math.max(this.minPriceLimit(), 1)); }
  get maxLog() { return Math.log10(Math.max(this.maxPriceLimit(), 1)); }

  // Convierte un precio real a un valor para el slider
  priceToLog(price: number | null, fallback: number): number {
    if (price === null) return Math.log10(Math.max(fallback, 1));
    return Math.log10(Math.max(price, 1));
  }

  // Convierte el valor del slider a un precio real, redondeando inteligentemente
  logToPrice(logVal: number): number {
    const price = Math.pow(10, logVal);
    // Redondeo dinámico para que los números se vean limpios en el input
    if (price > 100000000) return Math.round(price / 10000000) * 10000000;
    if (price > 10000000) return Math.round(price / 1000000) * 1000000;
    if (price > 1000000) return Math.round(price / 100000) * 100000;
    if (price > 100000) return Math.round(price / 10000) * 10000;
    return Math.round(price / 1000) * 1000;
  }

  // Se ejecuta cuando el usuario mueve las "bolitas" del slider
  // Se ejecuta cuando el usuario mueve las "bolitas" del slider
  updateTempPriceFromSlider(type: 'min' | 'max', event: any) {
    const logVal = Number(event.target.value);
    let price: number | null = this.logToPrice(logVal);

    // --- MAGIA UX: IMÁN A LOS EXTREMOS ---
    // Si el usuario arrastra al borde izquierdo absoluto, quitamos el límite mínimo ("Sin mínimo")
    if (type === 'min' && logVal <= this.minLog + 0.01) {
      price = null;
    }
    // Si arrastra al borde derecho absoluto, quitamos el límite máximo ("Sin máximo")
    if (type === 'max' && logVal >= this.maxLog - 0.01) {
      price = null;
    }

    const currentMin = this.tempPrecioMin() !== null ? this.tempPrecioMin()! : this.minPriceLimit();
    const currentMax = this.tempPrecioMax() !== null ? this.tempPrecioMax()! : this.maxPriceLimit();

    if (type === 'min') {
      if (price !== null && price > currentMax) price = currentMax;
      this.tempPrecioMin.set(price);
    } else {
      if (price !== null && price < currentMin) price = currentMin;
      this.tempPrecioMax.set(price);
    }
  }

  // Se ejecuta cuando el usuario escribe los números a mano y da Enter o pierde el foco
  updateTempPriceFromInput(type: 'min' | 'max', event: any) {
    const rawValue = event.target.value;

    // Usamos nuestra nueva función para extraer el número puro
    let val = this.parseCurrency(rawValue);

    const currentMin = this.tempPrecioMin() !== null ? this.tempPrecioMin()! : this.minPriceLimit();
    const currentMax = this.tempPrecioMax() !== null ? this.tempPrecioMax()! : this.maxPriceLimit();

    if (val !== null) {
      if (type === 'min' && val > currentMax) val = currentMax;
      if (type === 'max' && val < currentMin) val = currentMin;
    }

    if (type === 'min') {
      this.tempPrecioMin.set(val);
    } else {
      this.tempPrecioMax.set(val);
    }

    // Forzamos a que el input visualice el número ya formateado en pesos
    event.target.value = this.formatCurrency(val);
  }

  get sliderMinPercent() {
    if (this.minLog === this.maxLog) return 0;
    const currL = this.priceToLog(this.tempPrecioMin(), this.minPriceLimit());
    return ((currL - this.minLog) / (this.maxLog - this.minLog)) * 100;
  }

  get sliderMaxPercent() {
    if (this.minLog === this.maxLog) return 100;
    const currL = this.priceToLog(this.tempPrecioMax(), this.maxPriceLimit());
    return ((currL - this.minLog) / (this.maxLog - this.minLog)) * 100;
  }

  isBarActive(index: number): boolean {
    const rangeL = this.maxLog - this.minLog;
    const barMinLog = this.minLog + (rangeL / this.histogramBars.length) * index;
    const barMaxLog = this.minLog + (rangeL / this.histogramBars.length) * (index + 1);

    const currMinLog = this.priceToLog(this.tempPrecioMin(), this.minPriceLimit());
    const currMaxLog = this.priceToLog(this.tempPrecioMax(), this.maxPriceLimit());

    return barMaxLog >= currMinLog && barMinLog <= currMaxLog;
  }

  applyPriceAction() {
    this.filters.update(f => ({
      ...f,
      precioMin: this.tempPrecioMin(),
      precioMax: this.tempPrecioMax()
    }));
    this.isPriceDropdownOpen.set(false);
    this.applyFilters();
  }

  // --- INIT Y LÓGICA EXISTENTE ---

  ngOnInit() {
    this.id = '1';
    this.geometryService.setIdVisor(this.id);
    this.loadProperties();

    this.infoInmuebleService.propertyUpdated$.subscribe((updatedProp) => {
      const allData = this.property() || [];
      const indexMaster = allData.findIndex((p: any) => p.id === updatedProp.id);
      if (indexMaster !== -1) {
        allData[indexMaster] = updatedProp;
        this.property.set([...allData]);
      }

      const visibleData = this.filteredProperties();
      const indexFiltered = visibleData.findIndex((p: any) => p.id === updatedProp.id);
      if (indexFiltered !== -1) {
        visibleData[indexFiltered] = updatedProp;
        this.filteredProperties.set([...visibleData]);
      }
    });
  }

  loadProperties() {
    this.isLoading.set(true);

    this.infoInmuebleService.getProperties(this.filters()).subscribe({
      next: (data) => {
        const arrayData = data.results || [];
        this.property.set(arrayData);

        this.buildDynamicFilters(arrayData);
        this.calculatePriceLimits(arrayData);

        this.filteredProperties.set(arrayData);
        this.totalCount.set(arrayData.length);
        this.isLoading.set(false);

        if (this.mapComponent) {
          this.mapComponent.setFullData(arrayData);
        }
      },
      error: (err) => {
        console.error('Error cargando propiedades', err);
        this.isLoading.set(false);
      }
    });
  }

  private buildDynamicFilters(data: any[]) {
    this.filterOptions.tiposBien = this.extractUnique(data, 'tipo_bien_id', 'tipo_bien');
    this.filterOptions.tiposPredio = this.extractUnique(data, 'tipo_predio_id', 'tipo_predio');
    this.filterOptions.clasificaciones = this.extractUnique(data, 'clasificacion_id', 'clasificacion');
    this.filterOptions.departamentos = this.extractUnique(data, 'departamento_id', 'departamento');
    this.filterOptions.municipios = this.extractUnique(data, 'municipio_id', 'municipio');
  }

  private extractUnique(data: any[], idKey: string, labelKey: string) {
    const uniqueMap = new Map();
    data.forEach(item => {
      const id = item[idKey];
      const label = item[labelKey];
      if (id != null && !uniqueMap.has(id)) {
        uniqueMap.set(id, { id: id, label: label });
      }
    });
    return Array.from(uniqueMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }

  private calculatePriceLimits(data: any[]) {
    if (data.length === 0) return;
    const prices = data.map(item => Number(item.valor_inmueble)).filter(p => !isNaN(p));
    if (prices.length > 0) {
      let min = Math.min(...prices);
      let max = Math.max(...prices);
      if (min === max) { max = min + 100000; } // Seguridad si solo hay 1 inmueble

      this.minPriceLimit.set(min);
      this.maxPriceLimit.set(max);
    }
  }

  updateListFromMap(properties: any[]) {
    let newList = [...properties];
    const currentSelectedId = this.selectedPropertyId();

    if (currentSelectedId) {
      const selectedIndex = newList.findIndex((item: any) => item.id === currentSelectedId);
      if (selectedIndex > 0) {
        const [selectedItem] = newList.splice(selectedIndex, 1);
        newList.unshift(selectedItem);
      }
    }
    this.filteredProperties.set(newList);
    this.totalCount.set(newList.length);
  }

  onPropertySelected(id: string) {
    this.infoInmuebleService.selectedPropertyId.set(id);

    const currentList = [...this.filteredProperties()];
    const index = currentList.findIndex((item: any) => item.id === id);

    if (index > 0) {
      const [selectedItem] = currentList.splice(index, 1);
      currentList.unshift(selectedItem);
      this.filteredProperties.set(currentList);
    }

    const panel = document.querySelector('.results-grid');
    if (panel) {
      panel.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  updateFilter(key: string, event: any) {
    const value = (event.target as HTMLSelectElement).value;
    this.filters.update(prev => ({ ...prev, [key]: value }));
    this.applyFilters();
  }

  applyFilters() {
    const currentFilters = this.filters();
    const allData = this.property() || [];

    const logicFiltered = allData.filter((item: any) => {
      return this.filterByCustomPrice(item.valor_inmueble, currentFilters.precioMin, currentFilters.precioMax) &&
        this.filterByID(Number(item.tipo_bien_id), Number(currentFilters.tipo_bien_id)) &&
        this.filterByID(Number(item.tipo_predio_id), Number(currentFilters.tipo_predio_id)) &&
        this.filterByID(Number(item.clasificacion_id), Number(currentFilters.clasificacion_id)) &&
        this.filterByID(Number(item.departamento_id), Number(currentFilters.departamento_id)) &&
        this.filterByID(Number(item.municipio_id), Number(currentFilters.municipio_id));
    });

    this.filteredProperties.set(logicFiltered);
    this.totalCount.set(logicFiltered.length);

    if (this.mapComponent) {
      this.mapComponent.setFullData(logicFiltered);
      this.mapComponent.focusOnData(logicFiltered);
    }
  }

  private filterByCustomPrice(itemPrice: number, min: number | null, max: number | null): boolean {
    const price = Number(itemPrice);
    if (isNaN(price)) return false;
    if (min !== null && price < min) return false;
    if (max !== null && price > max) return false;
    return true;
  }

  private filterByID(itemValue: number, filterValue: number): boolean {
    if (!filterValue) return true;
    return itemValue === filterValue;
  }


  // --- FORMATEO DE MONEDA (PESOS COLOMBIANOS) ---

  // Convierte un número (1500000) a texto formateado ("$ 1.500.000")
  formatCurrency(val: number | null): string {
    if (val === null || isNaN(val)) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(val);
  }

  // Convierte el texto formateado ("$ 1.500.000") de vuelta a número puro (1500000)
  parseCurrency(val: string): number | null {
    if (!val) return null;
    // Elimina todo lo que no sea un dígito (quita el $, los puntos y los espacios)
    const numericString = val.replace(/\D/g, '');
    if (!numericString) return null;
    return parseInt(numericString, 10);
  }
}