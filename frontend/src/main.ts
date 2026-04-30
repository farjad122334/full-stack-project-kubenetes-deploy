import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import 'zone.js';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideCharts(withDefaultRegisterables())

  ]
})

  .catch((err) => console.error(err));

