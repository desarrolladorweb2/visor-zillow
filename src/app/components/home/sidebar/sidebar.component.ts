import { CommonModule } from '@angular/common';
import {
  Component,
  ComponentRef,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SideBar } from '../../../interfaces/sidebar';
import { SearcherSidebarComponent } from '../../widget/searcher-sidebar/searcher-sidebar.component';
import { GenericDialogComponent } from '../../shared/generic-dialog/generic-dialog.component';
import { DialogService } from '../../../core/services/shared/dialog.service';
import { SidebarService } from '../../../core/services/home/sidebar.service';
import { DownloadComponent } from '../../widget/download/download.component';
import { GlobalUserParamService } from '../../../core/services/global-user-param.service';
import { ImportLayerComponent } from '../../widget/import-layer/import-layer.component';
import { ShowLayerComponent } from '../../widget/show-layer/show-layer.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.less',
})
export class SidebarComponent implements OnInit {
  @Input() idVisor!: string;
  activeIndex: number | null = null;
  imagesDefault: SideBar[] = [];

  dialog: ComponentRef<GenericDialogComponent> | null = null;
  @ViewChild('sidebarContainer') sidebarContainer!: ElementRef;

  sidebarOpen = false;
  paramsUser: string = '';
  showMessageMariBubble: boolean = false;

  constructor(
    private readonly sidebarService: SidebarService,
    private readonly dialogService: DialogService,
    private readonly globalUserParamService: GlobalUserParamService
  ) {}

  ngOnInit() {
    this.getIcons();

    this.globalUserParamService.params$.subscribe((p) => {
      this.paramsUser = p?.['role'];
    });
  }

  getIcons(): void {
    this.imagesDefault = this.sidebarService.getSideBar();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;

    if (!this.sidebarOpen) {
      this.resetAllSidebarState();
    }
  }

  toggleBubble() {
    this.showMessageMariBubble = !this.showMessageMariBubble;
  }

  resetAllSidebarState(): void {
    this.activeIndex = null;
  }

  hoverIndex: number | null = null; // ícono en hover

  onChangeImage(id: number): void {
      this.dialogService.closeAll();
    if (this.activeIndex == id) {
      // si ya estaba activo -> apagar
      this.activeIndex = null;
    } else {
      // encender y apagar los demás
      this.activeIndex = id;
      this.openDialog(this.imagesDefault[id - 1]);
    }
  }

  onMouseEnter(id: number): void {
    this.hoverIndex = id;
  }

  onMouseLeave(id: number): void {
    this.hoverIndex = null;
  }

  openDialog(img: any) {
    let componentToLoad: any = null;

    switch (img.id) {
      case 1:
        componentToLoad = ShowLayerComponent;
        break;
      case 2:
        componentToLoad = SearcherSidebarComponent;
        break;
      case 3:
        componentToLoad = DownloadComponent;
        break;
      case 4:
        componentToLoad = ImportLayerComponent;
        break;
      // default:
      //   console.warn('Componente de diálogo no definido para el ID:', img.id);
      //   return;
    }

    this.sidebarOpen = false;
    this.dialogService.open({ component: componentToLoad, data: this.idVisor });
  }

  resetImagesToDark(): void {
    this.imagesDefault.forEach((element) => {
      element.type = 'dark';
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (
      this.sidebarOpen &&
      !this.sidebarContainer.nativeElement.contains(event.target) &&
      !(event.target as HTMLElement).closest('.hamburger-button')
    ) {
      this.sidebarOpen = false;
    }
  }
}
