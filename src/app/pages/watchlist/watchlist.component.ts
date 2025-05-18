import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription } from 'rxjs';
import { UserService } from '../../shared/services/user.service';
import { User } from '../../shared/user';
import { watchlist } from '../../shared/watchlist';
import { Cryptocurrency } from '../../shared/cryptocurrency';
import { CryptoChangePipe } from '../../shared/CryptoChangePipe';
import { FormatLargeNumberPipe } from '../../shared/FormatLargeNumberPipe';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    CryptoChangePipe,
    FormatLargeNumberPipe,
  ],
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss']
})
export class WatchlistComponent implements OnInit, OnDestroy {
  user: User | null = null;
  watchlistItems: watchlist[] = [];
  stats = {
    total: 0,
    totalValue: 0,
    highestValue: null as Cryptocurrency | null,
    lowestValue: null as Cryptocurrency | null,
    bestPerformer: null as Cryptocurrency | null,
    worstPerformer: null as Cryptocurrency | null
  };

  performanceMetrics = {
    averageChange: 0,
    totalMarketCap: 0,
    totalVolume: 0
  };

  isLoading = true;
  isPerformanceLoading = true;

  private watchlistSubscription: Subscription | null = null;
  private performanceSubscription: Subscription | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUserWatchlist();
    this.loadWatchlistPerformance();
  }

  ngOnDestroy(): void {
    if (this.watchlistSubscription) {
      this.watchlistSubscription.unsubscribe();
    }
    if (this.performanceSubscription) {
      this.performanceSubscription.unsubscribe();
    }
  }

  loadUserWatchlist(): void {
    this.isLoading = true;
    this.watchlistSubscription = this.userService.getUserWatchlist().subscribe({
      next: (data) => {
        this.user = data.user;
        this.watchlistItems = data.watchlistItems;
        this.stats = data.stats;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Hiba történt a felhasználó watchlistjének betöltése közben:', error);
        this.isLoading = false;
      }
    });
  }

  loadWatchlistPerformance(): void {
    this.isPerformanceLoading = true;
    this.performanceSubscription = this.userService.getWatchlistPerformance().subscribe({
      next: (data) => {
        this.performanceMetrics = data.performanceMetrics;
        this.isPerformanceLoading = false;
      },
      error: (error) => {
        console.error('Hiba történt a felhasználó watchlistjének statisztikáinak betöltése közben:', error);
        this.isPerformanceLoading = false;
      }
    });
  }

  getUserInitials(): string {
    if (!this.user || !this.user.username) return '?';
    return this.user.username.charAt(0).toUpperCase();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  removeFromWatchlist(cryptoId: string): void {
    this.userService.removeFromWatchlist(cryptoId).subscribe({
      next: (success) => {
        if (success) {
          this.loadUserWatchlist();
          this.loadWatchlistPerformance();
        }
      },
      error: (error) => {
        console.error('Hiba történt a watchlistről való eltávolítás közben:', error);
      }
    });
  }
}
