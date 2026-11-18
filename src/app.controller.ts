import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {

  @Get('hello')
  hello() {
    const nombre = process.env.NOMBRE || 'Tu Nombre';
    return {
      mensaje: `Hola, soy ${nombre}`
    };
  }

  @Get('variable')
  variable() {
    const valor = process.env.MI_VARIABLE || 'Valor por defecto';
    return {
      variable: valor
    };
  }

  @Get('secreto')
  secreto() {
    return {
      mensaje: 'ENDPOINT para Azure Key Vault'
    };
  }

  @Get('imagen')
  imagen() {
    return {
      mensaje: 'ENDPOINT para Azure Blob Storage'
    };
  }
}
