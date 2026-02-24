import { Component, ViewChild, ViewContainerRef, ComponentRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-generic-dialog',
  imports: [],
  templateUrl: './generic-dialog.component.html',
  styleUrl: './generic-dialog.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericDialogComponent implements  OnDestroy {
  @ViewChild('contentContainer', { read: ViewContainerRef, static: true }) contentContainer!: ViewContainerRef;
  componentRef: ComponentRef<any> | null = null;
  closeCallback: (() => void) | null = null;

  // loadContentComponent2(component: any, data?: any): ComponentRef<any> {
  //   this.contentContainer.clear();
  //   this.componentRef = this.contentContainer.createComponent(component);
  //   if (data) {
  //     const dataObj = typeof data === 'object' ? data : { data };
  //     Object.assign(this.componentRef.instance, dataObj);
  //     console.log('data dialogo: ', dataObj);
  //   }
  //   return this.componentRef;
  // }

  loadContentComponent(component: any, data?: any): ComponentRef<any> {
    this.contentContainer.clear();
    this.componentRef = this.contentContainer.createComponent(component);
    if (data) {
      const newData = JSON.parse(JSON.stringify(data));
      
      if ('data$' in this.componentRef.instance) {
        const dataSubject = new BehaviorSubject(newData);
        this.componentRef.setInput('data$', dataSubject);
      }
      else if ('data' in this.componentRef.instance) {
        this.componentRef.setInput('data', newData);
      }
      this.componentRef.changeDetectorRef.detectChanges();
    }
    return this.componentRef;
  }
  
  setCloseCallback(callback: () => void) {
    this.closeCallback = callback;
  }

  close() {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
    if (this.closeCallback) {
      this.closeCallback();
      this.closeCallback = null;
    }
  }

  ngOnDestroy(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }
}
