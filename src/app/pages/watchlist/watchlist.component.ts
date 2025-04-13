import { Component} from '@angular/core';
import { watchlist } from '../../shared/watchlist';
import { DatePipe } from '@angular/common';
import { DecimalPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { CryptoChangePipe } from '../../shared/CryptoChangePipe';

@Component({
  selector: 'app-watchlist',
  imports: [DatePipe, 
    DecimalPipe, 
    MatTableModule,
    CryptoChangePipe],
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss'],
  standalone: true,

})
export class WatchlistComponent {
  watchlistCryptos: watchlist[] = [
    {
      cryptocurrency: {
        id: '1',
        name: 'Bitcoin',
        symbol: 'BTC',
        price: 30000,
        marketCap: 600000000,
        dailyVolume: 50000000,
        change: 1.5
      },
      addedAt: new Date()
    },
    {
      cryptocurrency: {
        id: '2',
        name: 'Ethereum',
        symbol: 'ETH',
        price: 2000,
        marketCap: 250000000,
        dailyVolume: 30000000,
        change: -2.3
      },
      addedAt: new Date()
    }
  ];
}
