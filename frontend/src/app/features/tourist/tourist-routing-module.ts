import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Explore } from './explore/explore';
import { SubmitPlan } from './submit-plan/submit-plan';
import { MyBookings } from './my-bookings/my-bookings';
import { Payments } from './payments/payments';
import { Profile } from './profile/profile';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: 'dashboard', component: Dashboard },
  { path: 'explore', component: Explore },
  { path: 'tour-details/:id', loadComponent: () => import('./tour-details/tour-details').then(m => m.TourDetailsComponent) },
  { path: 'submit-plan', component: SubmitPlan },
  { path: 'my-bookings', component: MyBookings },
  { path: 'payments', component: Payments },
  { path: 'trip-history', loadComponent: () => import('./trip-history/trip-history').then(m => m.TripHistory) },
  { path: 'notifications', loadComponent: () => import('../../shared/components/notifications/notifications.component').then(m => m.SharedNotificationsComponent) },
  { path: 'settings', loadComponent: () => import('./settings/settings').then(m => m.Settings) },
  { path: 'profile', component: Profile },
  { path: 'booking-success', loadComponent: () => import('./booking-success/booking-success').then(m => m.BookingSuccess) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TouristRoutingModule { }
