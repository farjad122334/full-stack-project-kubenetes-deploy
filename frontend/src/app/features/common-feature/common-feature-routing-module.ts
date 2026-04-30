import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';
import { Contact } from './contact/contact';
import { Login } from './login/login';
import { Chatbot } from '../../shared/widgets/chatbot/chatbot';
import { Error404 } from './error404/error404';
import { ForgotPasswordComponent } from './forgot-password/forgot-password';
import { ForgotPasswordOtpComponent } from './forgot-password-otp/forgot-password-otp';
import { ResetPasswordComponent } from './reset-password/reset-password';

const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'contact', component: Contact },
  { path: 'login', component: Login },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'forgot-password-otp', component: ForgotPasswordOtpComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'chatbot', component: Chatbot },
  { path: '**', component: Error404 }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommonFeatureRoutingModule { }
