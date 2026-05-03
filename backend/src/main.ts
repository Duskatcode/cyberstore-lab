import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.use(helmet());

  app.enableCors({
  origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:8080',
  credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (process.env.ENABLE_SWAGGER === 'true') {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('CyberStore Lab API')
    .setDescription('Secure MVP API for CyberStore Lab')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/v1/docs', app, document);
}

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap();