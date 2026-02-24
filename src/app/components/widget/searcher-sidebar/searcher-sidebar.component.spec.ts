import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearcherSidebarComponent } from './searcher-sidebar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SearcherSidebarService } from '../../../core/services/widget/searcher-sidebar.service';

describe('SearcherSidebarComponent', () => {
  let component: SearcherSidebarComponent;
  let fixture: ComponentFixture<SearcherSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SearcherSidebarComponent,
        HttpClientTestingModule
      ],
      providers: [
        SearcherSidebarService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearcherSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
