import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'exchange',
        loadComponent: () => import('./pages/exchange/exchange.component').then(m => m.ExchangeComponent)
    },
    {
        path: 'watchlist',
        loadComponent: () => import('./pages/watchlist/watchlist.component').then(m => m.WatchlistComponent)
    },
    {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'signup',
        loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent)
    },
    {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
    },
];
