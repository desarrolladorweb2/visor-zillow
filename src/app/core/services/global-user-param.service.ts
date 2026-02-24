import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalUserParamService {

  private readonly _params$ = new BehaviorSubject<Params | null>(null);

  readonly params$ = this._params$.asObservable();

  setParams(params: Params): void {
    this._params$.next(params);
  }

  get currentParams(): Params | null {
    return this._params$.getValue();
  }
}
