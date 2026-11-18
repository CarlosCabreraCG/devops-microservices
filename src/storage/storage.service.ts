
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';

@Injectable()
export class StorageService {
  private blobServiceClient: BlobServiceClient;

  constructor() {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;

    if (!accountName) {
      throw new Error(
        'Falta configurar AZURE_STORAGE_ACCOUNT_NAME',
      );
    }

    const credential = new DefaultAzureCredential();

    const accountUrl =
      `https://${accountName}.blob.core.windows.net`;

    this.blobServiceClient = new BlobServiceClient(
      accountUrl,
      credential,
    );
  }

  async obtenerImagen(blobName: string) {
    try {
      const containerName =
        process.env.AZURE_STORAGE_CONTAINER_NAME;

      if (!containerName) {
        throw new Error(
          'Falta configurar AZURE_STORAGE_CONTAINER_NAME',
        );
      }

      const containerClient =
        this.blobServiceClient.getContainerClient(containerName);

      const blobClient =
        containerClient.getBlobClient(blobName);

      const response = await blobClient.download();

      if (!response.readableStreamBody) {
        throw new InternalServerErrorException(
          'No se pudo obtener el contenido de la imagen',
        );
      }

      return {
        stream: response.readableStreamBody,
        contentType:
          response.contentType || 'application/octet-stream',
      };

    } catch (error) {
      if (
        (error as { statusCode?: number }).statusCode === 404
      ) {
        throw new NotFoundException(
          'No se encontró la imagen en Azure Blob Storage',
        );
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error(
        'Error al consultar Azure Blob Storage:',
        error,
      );

      throw new InternalServerErrorException(
        'No fue posible obtener la imagen desde Azure Blob Storage',
      );
    }
  }
}
