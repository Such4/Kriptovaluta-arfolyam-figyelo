import { Component } from '@angular/core';
import { User } from '../../shared/user';
import { NgFor } from '@angular/common';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [NgFor,
    NgIf
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  user: User = {
    id: 'dummyId',
    username: 'dummyUser',
    email: 'dummy@example.com',
    password: "2e315dcaa77983999bf11106c65229dc",
    watchlist: ['BTC', 'ETH']
  };

  showWatchlistTable: boolean = false;

  toggleWatchlistTable(): void {
    this.showWatchlistTable = !this.showWatchlistTable;
  }

  deleteWatchlistItem(item: string): void {
    this.user.watchlist = this.user.watchlist.filter(cryptoId => cryptoId !== item);
  }
}