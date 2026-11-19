import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { configureApp } from './configure-app.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  configureApp(app);

  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3001;

  await app.listen(port);

  console.log(`Backend running on port ${port}`);
}

await bootstrap();
