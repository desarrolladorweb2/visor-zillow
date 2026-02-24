import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatsToggleService {

  private readonly stateSubject = new BehaviorSubject<boolean>(false);
  readonly state$: Observable<boolean> = this.stateSubject.asObservable();

  show(): void {
    this.stateSubject.next(true);
  }

  hide(): void {
    this.stateSubject.next(false);
  }

  /** alternar manualmente */
  toggle(): void {
    this.stateSubject.next(!this.stateSubject.value);
  }
}
