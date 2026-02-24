import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GetSessionIdParamsService {

  private id: string | null = null;

  constructor(private readonly route: ActivatedRoute) {
    this.extractIdFromUrl();
  }

  private extractIdFromUrl(): void {
    this.route.queryParamMap.subscribe(params => {
      this.id = params.get('id') ?? null;
    });
  }

  get sessionId(): any {
    return this.id;
  }
}
