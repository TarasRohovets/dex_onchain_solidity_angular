import { Component, OnInit } from '@angular/core';
import Web3 from 'web3';

declare let window: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  web3;
  account;

  constructor() { }

  ngOnInit(): void {
    this.connectWallet();
  }

  async connectWallet() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      this.loadBlockChainData();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      this.loadBlockChainData();
    } else {
      window.alert('No Metamask detected');
    }
  }

  async loadBlockChainData() {
    this.web3 = window.web3;
    const accounts = await this.web3.eth.getAccounts();
    this.account = accounts[0];
    let balance = await this.web3.eth.getBalance(this.account);
    balance = this.web3.utils.fromWei(balance, 'ether');
  }

}
