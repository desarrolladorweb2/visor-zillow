import { Component } from '@angular/core';
import { Options, NgxSliderModule } from '@angular-slider/ngx-slider';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapService } from '../../../core/services/home/map/map.service';

@Component({
  selector: 'app-show-layer',
  imports: [NgxSliderModule, CommonModule, FormsModule],
  templateUrl: './show-layer.component.html',
  styleUrl: './show-layer.component.less',
})
export class ShowLayerComponent {
  layers: any[] = [];

  sliderOptions: Options = {
    floor: 0,
    ceil: 100,
    step: 1,
    showTicks: false,
    translate: (value: number): string => {
      return value + '%';
    },
  };

  constructor(private readonly mapService: MapService) {
    this.mapService.layerStates$.subscribe((states) => {
      //console.log('States =>', states)
      this.layers = Object.entries(states).map(([name, state,]) => ({
        layerName: name,
        labelName: state.labelName,
        visible: state.visible,
        opacity: state.opacity,
        type: state.type,
      }));
    });
  }

  toggleLayer(index: number, visible: boolean): void {
    const layer = this.layers[index];
    if (!layer) return;

    layer.visible = visible;
    this.mapService.toggleLayer(layer.layerName, visible);
    this.mapService.setLayerState(
      layer.layerName,
      visible,
      layer.opacity ?? 100,
      layer.type,
      layer.labelName
    );
  }

  changeOpacity(index: number): void {
    const layer = this.layers[index];
    if (!layer) return;

    this.mapService.setOpacity(layer.layerName, layer.opacity);
    this.mapService.setLayerState(
      layer.layerName,
      true,
      layer.opacity,
      layer.type,
      layer.labelName
    );
  }
}
