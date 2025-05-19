import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable, from, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { User } from '../user';
import { Cryptocurrency } from '../cryptocurrency';
import { watchlist } from '../watchlist';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) { }

  getCurrentUser(): Observable<User | null> {
    return this.authService.currentUser.pipe(
      switchMap(authUser => {
        if (!authUser) {
          return of(null);
        }
        
        const userDocRef = doc(this.firestore, 'Users', authUser.uid);
        return from(getDoc(userDocRef).then(userDoc => {
          if (!userDoc.exists()) {
            return null;
          }
          
          const userData = userDoc.data() as User;
          return { ...userData, id: authUser.uid };
        }).catch(error => {
          console.error('Hiba a felhasználó adatai lekérése közben:', error);
          return null;
        }));
      })
    );
  }
  
  updateUsername(userId: string, newUsername: string): Observable<boolean> {
    if (!userId) {
      return of(false);
    }
    
    const userDocRef = doc(this.firestore, 'Users', userId);
    return from(updateDoc(userDocRef, {
      username: newUsername
    }).then(() => true)
      .catch(error => {
        console.error('Hiba a felhasználónév frissítése közben:', error);
        throw error;
      })
    );
  }

  getUserWatchlist(): Observable<{
    user: User | null,
    watchlistItems: watchlist[],
    stats: {
      total: number,
      totalValue: number,
      highestValue: Cryptocurrency | null,
      lowestValue: Cryptocurrency | null,
      bestPerformer: Cryptocurrency | null,
      worstPerformer: Cryptocurrency | null
    }
  }> {
    return this.authService.currentUser.pipe(
      switchMap(authUser => {
        if (!authUser) {
          return of({
            user: null,
            watchlistItems: [],
            stats: { 
              total: 0, 
              totalValue: 0, 
              highestValue: null, 
              lowestValue: null,
              bestPerformer: null,
              worstPerformer: null
            }
          });
        }
        return from(this.fetchUserWithWatchlist(authUser.uid));
      })
    );
  }

  addToWatchlist(cryptoId: string): Observable<boolean> {
    return this.authService.currentUser.pipe(
      switchMap(authUser => {
        if (!authUser) {
          return of(false);
        }
        
        const userDocRef = doc(this.firestore, 'Users', authUser.uid);
        return from(updateDoc(userDocRef, {
          watchlist: arrayUnion(cryptoId)
        }).then(() => true)
          .catch(error => {
            console.error('Hiba történt a watchlisthez való hozzáadás közben:', error);
            return false;
          }));
      })
    );
  }

  removeFromWatchlist(cryptoId: string): Observable<boolean> {
    return this.authService.currentUser.pipe(
      switchMap(authUser => {
        if (!authUser) {
          return of(false);
        }
        
        const userDocRef = doc(this.firestore, 'Users', authUser.uid);
        return from(updateDoc(userDocRef, {
          watchlist: arrayRemove(cryptoId)
        }).then(() => true)
          .catch(error => {
            console.error('Hiba történt a watchlistről való eltávolítás közben:', error);
            return false;
          }));
      })
    );
  }

  isInWatchlist(cryptoId: string): Observable<boolean> {
    return this.authService.currentUser.pipe(
      switchMap(authUser => {
        if (!authUser) {
          return of(false);
        }
        
        const userDocRef = doc(this.firestore, 'Users', authUser.uid);
        return from(getDoc(userDocRef).then(userDoc => {
          if (!userDoc.exists()) {
            return false;
          }
          
          const userData = userDoc.data() as User;
          return userData.watchlist?.includes(cryptoId) || false;
        }).catch(error => {
          console.error('Hiba történt a watchlist lekérése közben:', error);
          return false;
        }));
      })
    );
  }

  private async fetchUserWithWatchlist(userId: string): Promise<{
    user: User | null,
    watchlistItems: watchlist[],
    stats: {
      total: number,
      totalValue: number,
      highestValue: Cryptocurrency | null,
      lowestValue: Cryptocurrency | null,
      bestPerformer: Cryptocurrency | null,
      worstPerformer: Cryptocurrency | null
    }
  }> {
    try {
      const userDocRef = doc(this.firestore, 'Users', userId);
      const userSnapshot = await getDoc(userDocRef);
      
      if (!userSnapshot.exists()) {
        return {
          user: null,
          watchlistItems: [],
          stats: { 
            total: 0, 
            totalValue: 0, 
            highestValue: null, 
            lowestValue: null,
            bestPerformer: null,
            worstPerformer: null
          }
        };
      }

      const userData = userSnapshot.data() as User;
      const user = { ...userData, id: userId };
      
      if (!user.watchlist || user.watchlist.length === 0) {
        return {
          user,
          watchlistItems: [],
          stats: { 
            total: 0, 
            totalValue: 0, 
            highestValue: null, 
            lowestValue: null,
            bestPerformer: null,
            worstPerformer: null
          }
        };
      }

      const cryptoCollection = collection(this.firestore, 'Cryptocurrencies');
      const q = query(cryptoCollection, where('id', 'in', user.watchlist));
      const cryptoSnapshot = await getDocs(q);
      
      const cryptocurrencies: Cryptocurrency[] = [];
      cryptoSnapshot.forEach(doc => {
        cryptocurrencies.push({ ...doc.data() } as Cryptocurrency);
      });

      const watchlistCollection = collection(this.firestore, 'WatchlistEntries');
      const watchlistQuery = query(watchlistCollection, where('userId', '==', userId));
      const watchlistSnapshot = await getDocs(watchlistQuery);
      
      const watchlistTimestamps = new Map<string, Date>();
      watchlistSnapshot.forEach(doc => {
        const data = doc.data();
        if (data && data['cryptoId'] && data['addedAt']) {
          watchlistTimestamps.set(data['cryptoId'], data['addedAt'].toDate())
        }
      });

      const watchlistItems: watchlist[] = cryptocurrencies.map(crypto => ({
        cryptocurrency: crypto,
        addedAt: watchlistTimestamps.get(crypto.id) || new Date()
      }));

      const total = watchlistItems.length;
      const totalValue = watchlistItems.reduce((sum, item) => sum + item.cryptocurrency.price, 0);
      
      let highestValue: Cryptocurrency | null = null;
      let lowestValue: Cryptocurrency | null = null;
      let bestPerformer: Cryptocurrency | null = null;
      let worstPerformer: Cryptocurrency | null = null;
      
      if (cryptocurrencies.length > 0) {
        highestValue = cryptocurrencies.reduce((max, crypto) => 
          crypto.price > (max?.price || 0) ? crypto : max, cryptocurrencies[0]);
        
        lowestValue = cryptocurrencies.reduce((min, crypto) => 
          crypto.price < (min?.price || Infinity) ? crypto : min, cryptocurrencies[0]);
        
        bestPerformer = cryptocurrencies.reduce((best, crypto) => 
          crypto.change > (best?.change || -Infinity) ? crypto : best, cryptocurrencies[0]);
        
        worstPerformer = cryptocurrencies.reduce((worst, crypto) => 
          crypto.change < (worst?.change || Infinity) ? crypto : worst, cryptocurrencies[0]);
      }

      return {
        user,
        watchlistItems,
        stats: {
          total,
          totalValue,
          highestValue,
          lowestValue,
          bestPerformer,
          worstPerformer
        }
      };
    } catch (error) {
      console.error('Hiba történt a watchlist adatai betöltése közben:', error);
      return {
        user: null,
        watchlistItems: [],
        stats: { 
          total: 0, 
          totalValue: 0, 
          highestValue: null, 
          lowestValue: null,
          bestPerformer: null,
          worstPerformer: null
        }
      };
    }
  }

  getWatchlistPerformance(): Observable<{
    cryptocurrencies: Cryptocurrency[],
    performanceMetrics: {
      averageChange: number,
      totalMarketCap: number,
      totalVolume: number
    }
  }> {
    return this.authService.currentUser.pipe(
      switchMap(authUser => {
        if (!authUser) {
          return of({
            cryptocurrencies: [],
            performanceMetrics: {
              averageChange: 0,
              totalMarketCap: 0,
              totalVolume: 0
            }
          });
        }
        
        return from(this.fetchWatchlistPerformance(authUser.uid));
      })
    );
  }

  private async fetchWatchlistPerformance(userId: string): Promise<{
    cryptocurrencies: Cryptocurrency[],
    performanceMetrics: {
      averageChange: number,
      totalMarketCap: number,
      totalVolume: number
    }
  }> {
    try {
      const userDocRef = doc(this.firestore, 'Users', userId);
      const userSnapshot = await getDoc(userDocRef);
      
      if (!userSnapshot.exists()) {
        return {
          cryptocurrencies: [],
          performanceMetrics: {
            averageChange: 0,
            totalMarketCap: 0,
            totalVolume: 0
          }
        };
      }

      const userData = userSnapshot.data() as User;
      
      if (!userData.watchlist || userData.watchlist.length === 0) {
        return {
          cryptocurrencies: [],
          performanceMetrics: {
            averageChange: 0,
            totalMarketCap: 0,
            totalVolume: 0
          }
        };
      }
      const cryptoCollection = collection(this.firestore, 'Cryptocurrencies');
      const q = query(cryptoCollection, where('id', 'in', userData.watchlist));
      const cryptoSnapshot = await getDocs(q);
      
      const cryptocurrencies: Cryptocurrency[] = [];
      cryptoSnapshot.forEach(doc => {
        cryptocurrencies.push({ ...doc.data() } as Cryptocurrency);
      });

      const totalMarketCap = cryptocurrencies.reduce((sum, crypto) => sum + crypto.marketCap, 0);
      const totalVolume = cryptocurrencies.reduce((sum, crypto) => sum + crypto.dailyVolume, 0);
      const averageChange = cryptocurrencies.length > 0 ? 
        cryptocurrencies.reduce((sum, crypto) => sum + crypto.change, 0) / cryptocurrencies.length : 0;

      return {
        cryptocurrencies,
        performanceMetrics: {
          averageChange,
          totalMarketCap,
          totalVolume
        }
      };
    } catch (error) {
      console.error('Hiba történt a watchlist statisztikáinak betöltése közben:', error);
      return {
        cryptocurrencies: [],
        performanceMetrics: {
          averageChange: 0,
          totalMarketCap: 0,
          totalVolume: 0
        }
      };
    }
  }
}