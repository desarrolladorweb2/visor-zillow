import { Component, OnDestroy, OnInit } from '@angular/core';
import { FooterService } from '../../../core/services/home/footer.service';
import { Subscription } from 'rxjs';
import { MapService } from '../../../core/services/home/map/map.service';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, MatSelectModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.less',
})
export class FooterComponent implements OnInit, OnDestroy {
  public logoCompany?: string;
  cursorCoords: [number, number] | null = null;
  zoomLevel: string | null = null;
  zoomLevelMobile: number | string | null = null;

  private readonly subscriptions: Subscription = new Subscription();

  srcs: any = [
    { id: 1, name: 'EPSG:9377' },
    // {id: 2, name: "EPSG:4326"},
    // {id: 3, name: "EPSG:4326"}
  ];

  constructor(
    private readonly footerService: FooterService,
    private readonly mapService: MapService
  ) {}

  ngOnInit() {
    this.getIconCompany();
    this.subscriptions.add(
      this.mapService.cursorPosition$.subscribe((coords) => {
        this.cursorCoords = coords;
      })
    );

    this.subscriptions.add(
      this.mapService.zoomLevel$.subscribe((zoom) => {
        this.zoomLevel = zoom;
      })
    );

    this.subscriptions.add(
      this.mapService.zoomLevelMobile$.subscribe((zoom) => {
        this.zoomLevelMobile = zoom;
      })
    );
  }

  getIconCompany(): void {
    const logo = this.footerService.getFooterLogo();
    this.logoCompany = logo.logoCompany;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
