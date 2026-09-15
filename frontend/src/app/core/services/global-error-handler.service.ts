import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;
    
    console.error('🚨 [GlobalErrorHandler] Erro não tratado capturado:', error);

    if (chunkFailedMessage.test(error?.message)) {
      console.warn('⚠️ Falha de carregamento de chunk detectada. Recarregando a página...');
      window.location.reload();
    }
  }
}
