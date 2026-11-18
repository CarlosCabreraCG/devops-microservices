import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { KeyVaultService } from './key-vault/key-vault.service.js';
import { StorageService } from './storage/storage.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, KeyVaultService, StorageService,],
})
export class AppModule {}
