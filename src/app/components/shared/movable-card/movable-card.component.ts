import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-movable-card',
  imports: [CommonModule],
  templateUrl: './movable-card.component.html',
  styleUrl: './movable-card.component.less'
})
export class MovableCardComponent implements OnInit, OnChanges {
  @Input() initialX: number = 100;
  @Input() initialY: number = 50;
  @Input() paramWidth: number = 10;

  position = { x: 0, y: 0 }; 
  isDragging = false;
  private offsetX: number = 0;
  private offsetY: number = 0;

  @Input() headerClass: string | string[] | Record<string, boolean> = 'card-header text-white';
  @Input() showHeader = true;
  @Input() showFooter = true;

  constructor(private readonly elRef: ElementRef) {}

  ngOnInit(): void {
    this.position = { x: this.initialX, y: this.initialY };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialX'] && !this.isDragging) {
      this.position.x = changes['initialX'].currentValue;
    }
    if (changes['initialY'] && !this.isDragging) {
      this.position.y = changes['initialY'].currentValue;
    }
  }

  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.offsetX = event.clientX - this.position.x;
    this.offsetY = event.clientY - this.position.y;
    this.elRef.nativeElement.style.zIndex = '1001'; 
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.position = {
      x: event.clientX - this.offsetX,
      y: event.clientY - this.offsetY,
    };
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isDragging = false;
    this.elRef.nativeElement.style.zIndex = '1000';
  }
}
