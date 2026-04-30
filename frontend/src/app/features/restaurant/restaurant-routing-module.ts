import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard)
  },
  // Explore Tours removed - restaurants now see tours through Tour Requests tab
  // {
  //   path: 'explore-tours',
  //   loadComponent: () => import('./explore-tours/explore-tours').then(m => m.ExploreTours)
  // },
  {
    path: 'requests',
    loadComponent: () => import('./requests/requests').then(m => m.Requests)
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders/orders').then(m => m.Orders)
  },
  {
    path: 'menu',
    loadComponent: () => import('./menu/menu').then(mod => mod.Menu)
  },
  {
    path: 'earnings', // Kept for backward compatibility if needed, though removed from sidebar
    loadComponent: () => import('./earnings/earnings').then(m => m.Earnings)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile').then(m => m.Profile)
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings').then(m => m.Settings)
  },
  {
    path: 'notifications',
    loadComponent: () => import('../../shared/components/notifications/notifications.component').then(m => m.SharedNotificationsComponent)
  },
  {
    path: 'rooms',
    loadComponent: () => import('./rooms/rooms').then(m => m.Rooms)
  },
  {
    path: 'tour-requests',
    loadComponent: () => import('./tour-requests/tour-requests').then(m => m.TourRequests)
  },
  {
    path: 'ratings',
    loadComponent: () => import('./ratings/ratings').then(m => m.RestaurantRatings)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestaurantRoutingModule { }
