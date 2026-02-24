import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NewBasemapInfo } from '../../../interfaces/new-base-map-info';
@Injectable({
  providedIn: 'root',
})
export class ChangeBasemapService {
  private readonly basemapSubject = new BehaviorSubject<NewBasemapInfo>({
    url: '',
    subdomains: [],
    atribucion: ''
  });

  basemap$: Observable<NewBasemapInfo> = this.basemapSubject.asObservable();

  updateBasemap(info: NewBasemapInfo) {
    this.basemapSubject.next(info);
  }
}
