import { Injectable } from '@angular/core';
import { ToolBar } from '../../../interfaces/toolbar';

@Injectable({
  providedIn: 'root',
})
export class ToolbarService {
  constructor() {}

  getToolBar(): ToolBar[] {
    return [
      { image: 'toolbar_select_simple', type: 'dark', id: 1 },
      { image: 'toolbar_measure', type: 'dark', id: 2 },
      { image: 'toolbar_select_strokes', type: 'dark', id: 3 },
      { image: 'toolbar_delete', type: 'dark', id: 4 },
      { image: 'toolbar_update', type: 'dark', id: 5 },
    ];
  }
}
