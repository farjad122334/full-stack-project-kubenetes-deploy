import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Requests } from './requests/requests';
import { UpcomingTours } from './upcoming-tours/upcoming-tours';
import { MakeOffer } from './make-offer/make-offer';
import { BookedTours } from './booked-tours/booked-tours';
import { TripHistory } from './trip-history/trip-history';
import { Ratings } from './ratings/ratings';
import { Earnings } from './earnings/earnings';
import { Profile } from './profile/profile';
import { PerformanceInsights } from './performance-insights/performance-insights';
import { SharedNotificationsComponent } from '../../shared/components/notifications/notifications.component';

import { DriverSettings } from './settings/settings';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'requests', component: Requests },
  { path: 'upcoming-tours', component: UpcomingTours },
  { path: 'booked-tours', component: BookedTours },
  { path: 'trip-history', component: TripHistory },
  { path: 'ratings', component: Ratings },
  { path: 'make-offer', component: MakeOffer },
  { path: 'earnings', component: Earnings },
  { path: 'performance-insights', component: PerformanceInsights },
  { path: 'notifications', component: SharedNotificationsComponent },
  { path: 'profile', component: Profile },
  { path: 'settings', component: DriverSettings },
  { path: 'vehicles', loadComponent: () => import('./vehicles/vehicles').then(m => m.Vehicles) },
  { path: 'find-trips', loadComponent: () => import('./find-trips/find-trips').then(m => m.FindTrips) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverRoutingModule { }
