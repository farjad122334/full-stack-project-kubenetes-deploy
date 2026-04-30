import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { Error404 } from './features/common-feature/error404/error404';
import { Home } from './features/common-feature/home/home';
import { MainLayout } from './features/common-feature/main-layout/main-layout';
import { Login } from './features/common-feature/login/login';
import { RoleSelection } from './features/common-feature/role-selection/role-selection';
import { TouristSignup } from './features/common-feature/tourist-signup/tourist-signup';
import { DriverSignup } from './features/common-feature/driver-signup/driver-signup';
import { RestaurantSignup } from './features/common-feature/restaurant-signup/restaurant-signup';
import { VerifyOtp } from './features/common-feature/verify-otp/verify-otp';
import { OtpVerification } from './features/common-feature/otp-verification/otp-verification';
import { ForgotPasswordComponent } from './features/common-feature/forgot-password/forgot-password';
import { ForgotPasswordOtpComponent } from './features/common-feature/forgot-password-otp/forgot-password-otp';
import { ResetPasswordComponent } from './features/common-feature/reset-password/reset-password';
import { TouristLayout } from './features/tourist/layout/tourist-layout';
import { DriverLayout } from './features/driver/layout/driver-layout';
import { RestaurantLayout } from './features/restaurant/layout/restaurant-layout';
import { AdminLayout } from './features/admin/layout/admin-layout';
import { AccountPendingComponent } from './features/common-feature/account-pending/account-pending';
import { AiTest } from './features/ai-test/ai-test';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'ai-test', component: AiTest },

  { path: 'login', component: Login },
  { path: 'account-pending', component: AccountPendingComponent },
  { path: 'role-selection', component: RoleSelection },
  { path: 'tourist-signup', component: TouristSignup },
  { path: 'driver-signup', component: DriverSignup },
  { path: 'restaurant-signup', component: RestaurantSignup },
  { path: 'verify-otp', component: VerifyOtp },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'forgot-password-otp', component: ForgotPasswordOtpComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'home', component: Home },
    ]
  },
  {
    path: 'tourist',
    component: TouristLayout,
    canActivate: [roleGuard],
    data: { roles: ['Tourist'] },
    loadChildren: () =>
      import('./features/tourist/tourist-module').then(m => m.TouristModule),
  },
  {
    path: 'driver',
    component: DriverLayout,
    canActivate: [roleGuard],
    data: { roles: ['Driver'] },
    loadChildren: () =>
      import('./features/driver/driver-module').then(m => m.DriverModule),
  },
  {
    path: 'restaurant',
    component: RestaurantLayout,
    canActivate: [roleGuard],
    data: { roles: ['Restaurant', 'Hotel', 'ServiceProvider'] },
    loadChildren: () =>
      import('./features/restaurant/restaurant-module').then(m => m.RestaurantModule),
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    loadChildren: () =>
      import('./features/admin/admin-module').then(m => m.AdminModule),
  },

  { path: '**', component: Error404 },
];
