import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { correlationIdInterceptor } from './core/http.interceptors';
export const appConfig: ApplicationConfig = { providers: [provideBrowserGlobalErrorListeners(), provideHttpClient(withInterceptors([correlationIdInterceptor])), provideRouter(routes)] };
