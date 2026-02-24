import {
  Injectable,
  createComponent,
  ApplicationRef,
  ComponentRef,
} from '@angular/core';
import { GenericDialogComponent } from '../../../components/shared/generic-dialog/generic-dialog.component';
import { DialogConfig } from '../../../interfaces/dialog-config';
import { BehaviorSubject } from 'rxjs';
import { StatsToggleService } from '../widget/stats-toggle.service';
import { ConfirmDialogConfig } from '../../../interfaces/confirm-dialog';
import { ConfirmDialogComponent } from '../../../components/shared/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly dialogRefsMap = new Map<string, ComponentRef<any>>();
  public activeDialog$ =
    new BehaviorSubject<ComponentRef<GenericDialogComponent> | null>(null);
  private dialogComponentRefs: ComponentRef<GenericDialogComponent>[] = [];

  public activeConfirmDialog$ =
    new BehaviorSubject<ComponentRef<ConfirmDialogComponent> | null>(null);

  confirmDialogComponentRefs: ComponentRef<ConfirmDialogComponent>[] = [];

  constructor(
    private readonly appRef: ApplicationRef,
    private readonly statsToggleService: StatsToggleService
  ) {}

  open(config: DialogConfig): ComponentRef<any> {
    const dialogComponentRef = createComponent(GenericDialogComponent, {
      environmentInjector: this.appRef.injector,
    });

    document.body.appendChild(dialogComponentRef.location.nativeElement);
    this.appRef.attachView(dialogComponentRef.hostView);

    dialogComponentRef.instance.setCloseCallback(() => {
      this.close(dialogComponentRef);
    });

    if (config.component) {
      const dataSubject = new BehaviorSubject(config.data);
      dialogComponentRef.instance.loadContentComponent(
        config.component,
        dataSubject
      );
    }

    this.dialogComponentRefs?.push(dialogComponentRef);
    this.activeDialog$.next(dialogComponentRef);
    return dialogComponentRef;
  }

  openRefer(config: DialogConfig, key: string): ComponentRef<any> {
    const dialogRef = createComponent(GenericDialogComponent, {
      environmentInjector: this.appRef.injector,
    });

    document.body.appendChild(dialogRef.location.nativeElement);
    this.appRef.attachView(dialogRef.hostView);

    dialogRef.instance.setCloseCallback(() => {
      this.closeByKey(key);
    });

    if (config.component) {
      const dataSubject = new BehaviorSubject(config.data);
      dialogRef.instance.loadContentComponent(config.component, dataSubject);
    }

    this.dialogRefsMap.set(key, dialogRef);
    return dialogRef;
  }

  close(dialogRef: ComponentRef<any>) {
    const index = this.dialogComponentRefs.indexOf(dialogRef);
    if (index !== -1) {
      this.appRef.detachView(dialogRef.hostView);
      dialogRef.destroy();
      this.dialogComponentRefs.splice(index, 1);

      if (this.dialogComponentRefs.length === 0) {
        this.activeDialog$.next(null);
      } else {
        this.activeDialog$.next(this.dialogComponentRefs[0]);
      }
    }
    this.statsToggleService.hide();
  }

  closeAll() {
    this.dialogComponentRefs?.forEach((dialogRef) => {
      this.appRef.detachView(dialogRef.hostView);
      dialogRef.destroy();
    });
    this.dialogComponentRefs = [];
    this.activeDialog$.next(null);
    this.statsToggleService.hide();
  }

  closeByKey(key: string) {
    const dialogRef = this.dialogRefsMap.get(key);
    if (!dialogRef) return;

    this.appRef.detachView(dialogRef.hostView);
    dialogRef.destroy();
    this.dialogRefsMap.delete(key);

    if (this.dialogRefsMap.size === 0) {
      this.statsToggleService.hide();
    }
  }

  openDialog(config: ConfirmDialogConfig): ComponentRef<any> {
    const confirmDialogComponentRef = createComponent(ConfirmDialogComponent, {
      environmentInjector: this.appRef.injector,
    });

    document.body.appendChild(confirmDialogComponentRef.location.nativeElement);
    this.appRef.attachView(confirmDialogComponentRef.hostView);

    confirmDialogComponentRef.instance.setCloseCallback(() => {
      this.closeConfirm(confirmDialogComponentRef);
    });

    if (config) {
      const dataSubject = new BehaviorSubject(config);
      confirmDialogComponentRef.instance.setData(dataSubject);

      confirmDialogComponentRef.instance.title = config.title;
      confirmDialogComponentRef.instance.message = config.message;
      confirmDialogComponentRef.instance.colorModalType =
        config.colorModalType ?? 1;
      confirmDialogComponentRef.instance.modalType = config.modalType ?? 0; // Default to 0 if not provided
      confirmDialogComponentRef.instance.nameButton = config.nameButton ?? '';
      confirmDialogComponentRef.instance.hideActions =
        config.hideActions ?? false;
      confirmDialogComponentRef.instance.hideClose = config.hideClose ?? false;
      confirmDialogComponentRef.instance.valueY = config.valueY ?? 0;
      confirmDialogComponentRef.instance.valueX = config.valueX ?? 0;
      confirmDialogComponentRef.instance.onConfirm = () => {
        config.onConfirm?.();
        this.closeConfirm(confirmDialogComponentRef);
      };
      confirmDialogComponentRef.instance.onCancel = () => {
        config.onCancel?.();
        this.closeConfirm(confirmDialogComponentRef);
      };
    }

    this.confirmDialogComponentRefs?.push(confirmDialogComponentRef);
    this.activeConfirmDialog$.next(confirmDialogComponentRef);
    return confirmDialogComponentRef;
  }

  closeConfirm(dialogRef: ComponentRef<ConfirmDialogComponent>) {
    const index = this.confirmDialogComponentRefs.indexOf(dialogRef);
    if (index !== -1) {
      this.appRef.detachView(dialogRef.hostView);
      dialogRef.destroy();
      this.confirmDialogComponentRefs.splice(index, 1);

      if (this.confirmDialogComponentRefs.length === 0) {
        this.activeConfirmDialog$.next(null);
      } else {
        this.activeConfirmDialog$.next(this.confirmDialogComponentRefs[0]);
      }
    }
    this.statsToggleService.hide();
  }

  closeLast(): void {
    const lastDialog =
      this.dialogComponentRefs[this.dialogComponentRefs.length - 1];
    if (lastDialog) {
      this.close(lastDialog);
    }
  }
}
