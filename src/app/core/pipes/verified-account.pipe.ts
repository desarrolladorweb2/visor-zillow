import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'verifiedAccount'
})
export class VerifiedAccountPipe implements PipeTransform {

  transform(tipoId: string): string {
    switch (tipoId) {
      case '1': return 'assets/icon/sin_verificar.svg';
      case '2': return 'assets/icon/verificado.svg';
      case '3': return 'assets/icon/verificado_complementado.svg';
      case '4': return 'assets/icon/verificado_db_externas.svg';
      default: return '';
    }
  }
}
