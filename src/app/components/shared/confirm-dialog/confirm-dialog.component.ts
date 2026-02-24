import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { MovableCardComponent } from '../movable-card/movable-card.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  standalone: true,
  selector: 'app-confirm-dialog',
  imports: [CommonModule, MovableCardComponent],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.less',
})
export class ConfirmDialogComponent {
  title = '';
  message = '';
  hideActions = false;
  hideClose = false;
  nameButton = '';
  modalType: number = 0; // 0: default, 1: ovalado
  icon: string = '';
  colorModalType: number = 1; // 1: default, 2: white
  closeCallback: (() => void) | null = null;
  valueY: number = 0;
  valueX: number = 0;
  isSmallScreen: boolean = false;

  onConfirm?: () => void;
  onCancel?: () => void;

  constructor (private readonly breakpointObserver: BreakpointObserver) {
    this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.XSmall])
      .subscribe((result) => {
        this.isSmallScreen = result.matches;
      });
  }

  setData(data$: BehaviorSubject<any>) {
    data$.subscribe((data) => {
      this.title = data.title;
      this.valueY = data.valueY;
      this.valueX = data.valueX;
      this.message = data.message;
      this.nameButton = data.nameButton;
      this.icon = data.icon;
      this.colorModalType = data.colorModalType;
      this.hideActions = data.hideActions ?? false;
      this.hideClose = data.hideClose ?? false;
      this.onConfirm = data.onConfirm;
      this.onCancel = data.onCancel;
    });
  }

  confirm() {
    this.onConfirm?.();
  }

  cancel() {
    this.onCancel?.();
  }

  setCloseCallback(callback: () => void) {
    this.closeCallback = callback;
  }
}
