
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { KeyVaultService } from './key-vault/key-vault.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly keyVaultService: KeyVaultService,
  ) {}

  @Get('hello')
  hello() {
    const nombre = process.env.NOMBRE || 'Tu Nombre';

    return {
      mensaje: `Hola, soy ${nombre}`,
    };
  }

  @Get('variable')
  variable() {
    const valor = process.env.MI_VARIABLE || 'Valor por defecto';

    return {
      variable: valor,
    };
  }

  @Get('secreto')
  async secreto() {
    const nombreSecreto =
      process.env.AZURE_SECRET_NAME || 'mensaje-secreto';

    const valor = await this.keyVaultService.obtenerSecreto(
      nombreSecreto,
    );

    return {
      mensaje: 'Secreto obtenido correctamente desde Azure Key Vault',
      secreto: valor,
    };
  }

  @Get('imagen')
  imagen() {
    return {
      mensaje: 'ENDPOINT para Azure Blob Storage',
    };
  }
}
