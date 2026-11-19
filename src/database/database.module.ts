
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import path from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
      // Detectar si estamos en producción (Elastic Beanstalk) o desarrollo local
      const isProduction = !!configService.get('RDS_HOSTNAME');
          
      // Construir URL para Aurora RDS
      const host = configService.get<string>('RDS_HOSTNAME');
      const port = parseInt(configService.get<string>('RDS_PORT') || '5432' );
      const username = configService.get<string>('RDS_USERNAME');
      const password = configService.get<string>('RDS_PASSWORD');
      const database = configService.get<string>('RDS_DB_NAME');

      return {
        type: 'postgres',
        host: host,
        port: port,
        username: username,
        password: password,
        database: database,
        autoLoadEntities: true,
        synchronize: false, // ¡Importante! Siempre false en producción
        ssl: isProduction ? { rejectUnauthorized: false } : false,
        entities: [path.join(process.cwd(), 'dist/**/*.entity.js')],
      };
    }
    }), 
    ], 
})
export class DatabaseModule {}
