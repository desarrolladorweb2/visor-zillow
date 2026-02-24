import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToolBarVertical } from '../../../interfaces/toolbar-vertical';
import { ToolbarMapVerticalService } from '../../../core/services/widget/toolbar-map-vertical.service';

@Component({
  selector: 'app-toolbar-map-vertical',
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-map-vertical.component.html',
  styleUrl: './toolbar-map-vertical.component.less',
})
export class ToolbarMapVerticalComponent implements OnInit {
  activeIndex: number | null = null;
  imagesDefault: ToolBarVertical[] = [];
  @Input() zoomLevel: number = 8;
  @Output() resetMapEvent = new EventEmitter<void>();
  @Output() zoomInEvent = new EventEmitter<void>();
  @Output() zoomOutEvent = new EventEmitter<void>();
  @Output() rangeChangeEvent = new EventEmitter<number>();
  @Output() locateUserEvent = new EventEmitter<void>();
  @Output() markPointEvent = new EventEmitter<void>();

  constructor(private readonly toolbarMapVerticalService: ToolbarMapVerticalService) {}

  ngOnInit() {
    this.getIcons();
  }

  getIcons(): void {
    this.imagesDefault = this.toolbarMapVerticalService.getToolBarVertical();
  }

  resetMap(): void {
    this.resetMapEvent.emit();
  }

  zoomInClick(): void {
    this.zoomInEvent.emit();
  }

  zoomOutClick(): void {
    this.zoomOutEvent.emit();
  }

  onRangeChange(event: any): void {
    this.rangeChangeEvent.emit(event.target.value);
  }

  locateUserClick(): void {
    this.locateUserEvent.emit();
  }

  onMarkPointClick(): void {
    this.markPointEvent.emit();
  }
}
