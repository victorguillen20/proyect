import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { ClientRepository } from './domain/ports/client.repository';
import { ClientService } from './infrastructure/adapters/client.service';
import { AccountRepository } from './domain/ports/account.repository';
import { AccountService } from './infrastructure/adapters/account.service';
import { MovementRepository } from './domain/ports/movement.repository';
import { MovementService } from './infrastructure/adapters/movement.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(withFetch()),
    { provide: ClientRepository, useClass: ClientService },
    { provide: AccountRepository, useClass: AccountService },
    { provide: MovementRepository, useClass: MovementService }
  ]
};
