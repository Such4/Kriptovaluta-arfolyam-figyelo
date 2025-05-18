import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "kriptofigyelo", appId: "1:516128952571:web:68837f2da16d17fd1b205e", storageBucket: "kriptofigyelo.firebasestorage.app", apiKey: "AIzaSyCYTYAbaQRAztxF-yw2KkmEh0pbvY8zWC8", authDomain: "kriptofigyelo.firebaseapp.com", messagingSenderId: "516128952571" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};
