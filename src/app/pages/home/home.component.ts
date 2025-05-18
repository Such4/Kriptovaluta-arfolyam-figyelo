import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cryptocurrency } from '../../shared/cryptocurrency';
import { MatTableModule } from '@angular/material/table';
import { CryptoChangePipe } from '../../shared/CryptoChangePipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../shared/services/user.service';
import { CryptoService } from '../../shared/services/crypto.service';
import { Subscription } from 'rxjs';
import { FormatLargeNumberPipe } from '../../shared/FormatLargeNumberPipe';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatTableModule,
    CryptoChangePipe,
    FormatLargeNumberPipe,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true
})
export class HomeComponent implements OnInit, OnDestroy {
  cryptocurrencies: Cryptocurrency[] = [];
  displayedColumns: string[] = ['name', 'symbol', 'price', 'marketCap', 'change', 'actions'];
  isLoading = true;
  error: string | null = null;
  watchlistStatusMap: Record<string, boolean> = {};
  private watchlistSubscriptions: Record<string, Subscription> = {};
  
  constructor(
    private cryptoService: CryptoService,
    private userService: UserService
  ) {}
  
  ngOnInit(): void {
    this.loadCryptocurrencies();
  }
  
  ngOnDestroy(): void {
    Object.values(this.watchlistSubscriptions).forEach(subscription => {
      subscription.unsubscribe();
    });
  }
  
  loadCryptocurrencies(): void {
    this.isLoading = true;
    const subscription = this.cryptoService.getAllCryptocurrencies().subscribe({
      next: (data) => {
        this.cryptocurrencies = data;
        this.cryptocurrencies.forEach(crypto => {
          this.checkWatchlistStatus(crypto.id);
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Hiba történt betöltés közben:', error);
        this.isLoading = false;
      }
    });
    this.watchlistSubscriptions['cryptocurrencies'] = subscription;
  }
  private checkWatchlistStatus(cryptoId: string): void {
    if (this.watchlistSubscriptions[cryptoId]) {
      this.watchlistSubscriptions[cryptoId].unsubscribe();
    }
    this.watchlistSubscriptions[cryptoId] = this.userService.isInWatchlist(cryptoId).subscribe({
      next: (isInWatchlist) => {
        this.watchlistStatusMap[cryptoId] = isInWatchlist;
      },
      error: (error) => {
        console.error(`Hiba merült fel a watchlist státusz lekérdezése közben ${cryptoId}:`, error);
        this.watchlistStatusMap[cryptoId] = false;
      }
    });
  }
  
  toggleWatchlist(cryptoId: string, event: Event): void {
    event.stopPropagation();
    
    if (this.watchlistStatusMap[cryptoId]) {
      this.userService.removeFromWatchlist(cryptoId).subscribe({
        next: (success) => {
          if (success) {
            this.watchlistStatusMap[cryptoId] = false;
          }
        },
        error: (error) => {
          console.error('Hiba történt a watchlistról való eltávolítás közben:', error);
        }
      });
    } else {
      this.userService.addToWatchlist(cryptoId).subscribe({
        next: (success) => {
          if (success) {
            this.watchlistStatusMap[cryptoId] = true;
          }
        },
        error: (error) => {
          console.error('Hiba történt a watchlisthez való hozzáadás közben:', error);
        }
      });
    }
  }
}