import { Component } from '@angular/core';
import { Cryptocurrency } from '../../shared/cryptocurrency'
import { MatTableModule } from '@angular/material/table';
import { DecimalPipe } from '@angular/common';
import { CryptoChangePipe } from '../../shared/CryptoChangePipe';


@Component({
  selector: 'app-home',
  imports: [
    MatTableModule,
    DecimalPipe,
    CryptoChangePipe,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true
})
export class HomeComponent{
  cryptocurrencies: Cryptocurrency[] = [
    {
      id: '1',
      name: 'Bitcoin',
      symbol: 'BTC',
      price: 30000,
      marketCap: 600000000000,
      dailyVolume: 20000000000,
      change: 2.5
    },
    {
      id: '2',
      name: 'Ethereum',
      symbol: 'ETH',
      price: 2000,
      marketCap: 240000000000,
      dailyVolume: 12000000000,
      change: -1.2
    },
    {
      id: '3',
      name: 'Dogecoin',
      symbol: 'DOGE',
      price: 0.1,
      marketCap: 15000000000,
      dailyVolume: 1000000000,
      change: 0.8
    }
  ];
  displayedColumns: string[] = ['name', 'symbol', 'price', 'marketCap', 'change'];
}