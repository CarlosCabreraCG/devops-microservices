
import { Controller, Get, StreamableFile } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Readable } from 'stream';
import { KeyVaultService } from './key-vault/key-vault.service.js';
import { StorageService } from './storage/storage.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly keyVaultService: KeyVaultService,
    private readonly storageService: StorageService,
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
  async imagen(): Promise<StreamableFile> {
    const nombreImagen = process.env.AZURE_STORAGE_BLOB_NAME || 'imagen.jpg';
    const resultado = await this.storageService.obtenerImagen(nombreImagen);

    // Cast explícito al tipo Readable que espera StreamableFile
    const stream = resultado.stream as unknown as Readable;

    return new StreamableFile(stream, {
      type: resultado.contentType,
      disposition: 'inline',
    });
  }
}
