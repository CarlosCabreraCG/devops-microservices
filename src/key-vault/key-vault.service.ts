
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

@Injectable()
export class KeyVaultService {
  private client: SecretClient;

  constructor() {
    const vaultUrl = process.env.AZURE_KEY_VAULT_URL;

    if (!vaultUrl) {
      throw new Error('Falta configurar AZURE_KEY_VAULT_URL');
    }

    // Azure utiliza Managed Identity.
    const credential = new DefaultAzureCredential();

    this.client = new SecretClient(vaultUrl, credential);
  }

  async obtenerSecreto(secretName: string): Promise<string> {
    try {
      const secret = await this.client.getSecret(secretName);

      if (!secret.value) {
        throw new NotFoundException('El secreto no tiene un valor');
      }

      return secret.value;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if ((error as { statusCode?: number }).statusCode === 404) {
        throw new NotFoundException('No se encontró el secreto en Key Vault');
      }

      console.error('Error al consultar Azure Key Vault:', error);

      throw new InternalServerErrorException(
        'No fue posible obtener el secreto de Azure Key Vault',
      );
    }
  }
}