import { Component, OnInit } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Exchange } from '../../shared/exchange';

@Component({
  selector: 'app-exchange',
  imports: [PercentPipe, CommonModule],
  templateUrl: './exchange.component.html',
  styleUrl: './exchange.component.scss'
})
export class ExchangeComponent implements OnInit{
  exchanges: Exchange[] = [
    {
      id: '1',
      name: 'Binance',
      location: 'Malajzia',
      supportedCryptos: ['Bitcoin', 'Ethereum', 'Litecoin'],
      tradingFees: 0.001
    },
    {
      id: '2',
      name: 'Coinbase',
      location: 'Egyesült Államok',
      supportedCryptos: ['Bitcoin', 'Ripple', 'Dogecoin'],
      tradingFees: 0.015
    }
  ];

  constructor() {}

  ngOnInit(): void {}

}

