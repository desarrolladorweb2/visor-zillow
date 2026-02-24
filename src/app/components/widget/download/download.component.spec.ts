import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DownloadComponent } from './download.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DownloadSidebarService } from '../../../core/services/widget/download-sidebar.service';

describe('DownloadComponent', () => {
  let component: DownloadComponent;
  let fixture: ComponentFixture<DownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DownloadComponent,
        HttpClientTestingModule
      ],
      providers: [
        DownloadSidebarService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
