import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs} from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Cryptocurrency } from '../cryptocurrency';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  constructor(private firestore: Firestore) { }
  getAllCryptocurrencies(): Observable<Cryptocurrency[]> {
    return from(this.fetchAllCryptocurrencies()).pipe(
      catchError(error => {
        console.error('Hiba lépett fel a kriptók lekérdezése során:', error);
        return of([]);
      })
    );
  }
  private async fetchAllCryptocurrencies(): Promise<Cryptocurrency[]> {
    const cryptoCollection = collection(this.firestore, 'Cryptocurrencies');
    const snapshot = await getDocs(cryptoCollection);
    
    const cryptocurrencies: Cryptocurrency[] = [];
    snapshot.forEach(doc => {
      cryptocurrencies.push(doc.data() as Cryptocurrency);
    });
    return cryptocurrencies.sort((a, b) => b.marketCap - a.marketCap);
  }
}