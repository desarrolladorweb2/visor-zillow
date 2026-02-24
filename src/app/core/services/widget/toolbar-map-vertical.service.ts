import { Injectable } from '@angular/core';
import { ToolBarVertical } from '../../../interfaces/toolbar-vertical';

@Injectable({
  providedIn: 'root',
})
export class ToolbarMapVerticalService {

  getToolBarVertical(): ToolBarVertical[] {
    return [
      { image: 'toolbar_vertical_compass', id: 1 },
      { image: 'toolbar_vertical_locate', id: 2 },
      { image: 'toolbar_vertical_home', id: 3 }
    ];
  }
}
