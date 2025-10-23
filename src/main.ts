import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { connectMongo } from './config/mongo.provider';
import { logger } from './common/logger';

dotenv.config();

async function bootstrap() {
  await connectMongo();
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Orders Service')
    .setDescription('Serviço de gerenciamento de pedidos (Hexagonal)')
    .setVersion('1.0')
    .addTag('orders')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  logger.info(`Orders service running on ${port}`);
}

bootstrap().catch(err => {
  console.error('Bootstrap error', err);
  process.exit(1);
});