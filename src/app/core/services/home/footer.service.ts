import { Injectable } from '@angular/core';
import { Footer } from '../../../interfaces/footer';

@Injectable({
  providedIn: 'root',
})
export class FooterService { 
  constructor() {}

  getFooterLogo(): Footer {
    return  { logoCompany: 'footer_banistmo_blue'}
  }
}
