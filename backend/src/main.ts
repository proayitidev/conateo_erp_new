import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import moment from 'moment';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  moment.tz.setDefault('America/Port-au-Prince');
  app.enableCors({
    // Allow the Vue development server origin
    origin: '*',

    // Allow the standard methods used for API calls
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',

    // Allow credentials (like cookies or Authorization headers)
    credentials: true,
  });
  app.setGlobalPrefix('api', {
    exclude: [{ path: '.well-known/:param', method: RequestMethod.GET }],
  });
  console.log('helloo');
  const docConfig = new DocumentBuilder()
    .setTitle('Conatel ERP')
    .setDescription('Conatel ERP API documentation')
    .setVersion('1.0.0')
    .addTag('auth')
    .addTag('user')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, docConfig);
  SwaggerModule.setup('api', app, document);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      // whitelist: true,
      // stopAtFirstError: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
