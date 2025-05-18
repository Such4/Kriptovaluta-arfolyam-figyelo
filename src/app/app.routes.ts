import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './shared/guard/auth.guard';

export const routes: Routes = [
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'exchange',
        loadComponent: () => import('./pages/exchange/exchange.component').then(m => m.ExchangeComponent),
        canActivate: [authGuard]
    },
    {
        path: 'watchlist',
        loadComponent: () => import('./pages/watchlist/watchlist.component').then(m => m.WatchlistComponent),
        canActivate: [authGuard]
    },
    {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard]
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
        canActivate: [publicGuard]
    },
    {
        path: 'signup',
        loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent),
        canActivate: [publicGuard]
    },
    {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
    },
];
