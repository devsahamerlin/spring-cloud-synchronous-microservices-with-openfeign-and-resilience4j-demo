import { Routes } from '@angular/router';
import { Billing } from './billing/billing';
import { BillingDetails } from './billing-details/billing-details';
import { Home } from './home/home';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'bills', component: Billing, canActivate: [authGuard] },
  { path: 'bills/:id', component: BillingDetails, canActivate: [authGuard] },
];
