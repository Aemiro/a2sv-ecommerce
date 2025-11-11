import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '@libs/filters/http-exception.filter';
import { JwtAuthGuard } from '@libs/guards/jwt-auth.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as qs from 'qs';
function convertNumericKeysToArray(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (!Array.isArray(obj) && Object.keys(obj).every((k) => /^\d+$/.test(k))) {
    return Object.keys(obj)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => convertNumericKeysToArray(obj[k]));
  }

  for (const key in obj) {
    obj[key] = convertNumericKeysToArray(obj[key]);
  }
  return obj;
}
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // No extra options needed
  });
  app.use(helmet());
  app.setGlobalPrefix('api');
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      docExpansion: 'none',
    },
    customSiteTitle: 'A2SV E-commerce API',
  };
  const config = new DocumentBuilder()
    .addSecurity('basic', {
      type: 'http',
      scheme: 'basic',
    })
    .addBearerAuth()
    .setTitle('A2SV E-commerce API')
    .setDescription('A2SV E-commerce API Documentation')
    .setVersion('1.0')
    .setContact(
      'Aemiro Mekete',
      'https.linkedin.com/in/aemiro',
      'aemiromekete12@gmail.com',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });
  app.useGlobalFilters(new HttpExceptionFilter(app.get(EventEmitter2)));
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  SwaggerModule.setup('/', app, document, customOptions);
  app.enableCors({
    origin: '*',
  });
  app.setGlobalPrefix('api');
  // Middleware to parse query string with qs and convert numeric keys
  app.use((req, res, next) => {
    const urlParts = req.url.split('?');
    if (urlParts.length < 2) return next();

    const [pathname, queryString] = urlParts;

    // qs parse with allowDots:true so filter[0][0].field works
    const parsedQuery = qs.parse(queryString, { allowDots: true });
    const queryAsArray = convertNumericKeysToArray(parsedQuery);

    Object.defineProperty(req, 'query', {
      get: () => queryAsArray,
      enumerable: true,
    });

    req.url = pathname;
    next();
  });

  const PORT = process.env.PORT || 3000;
  await app
    .listen(PORT)
    .then(() => console.log(`app is running at port ${PORT}`));
}
bootstrap();
