import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarShowDataService {

  private readonly dataSubject = new BehaviorSubject<any>(null);  
  data$ = this.dataSubject.asObservable();  

  constructor() {}

  setData(data: any): void {
    this.dataSubject.next(data);  
  }

  getData(): any {
    return this.dataSubject.value; 
  }
}
