import { Component, OnInit } from '@angular/core';
import Web3 from 'web3';
import Dex from "build/contracts/Dex.json";

declare let window: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  web3;
  networkId;
  account;
  balance;
  depositedEthBalance;
  ethInput;
  dexContract;

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
    this.networkId = await this.web3.eth.net.getId();
    const accounts = await this.web3.eth.getAccounts();
    this.account = accounts[0];
    let balance = await this.web3.eth.getBalance(this.account);
    this.balance = this.web3.utils.fromWei(balance, 'ether');
    this.initAbisContracts();
    this.getEthBalance();
  }

  initAbisContracts() {
    const DexContract = Dex.networks[this.networkId];
    if (DexContract) {
      this.dexContract = new this.web3.eth.Contract(Dex.abi, DexContract.address);
      console.log(this.dexContract);
    }
  }

  depositEth() {
    const ethInputToUint = this.web3.utils.toWei(this.ethInput, 'ether');
    this.dexContract.methods
      .depositEth()
      .send({ value: ethInputToUint, from: this.account })
      .on("transactionHsh", (hash) => {
        console.log("depositEth()");
        this.loadBlockChainData();
        this.getEthBalance();
      });
  }

  // withdraw

  async getEthBalance() {
    let depositedEthBalance = await this.dexContract.methods.getEthBalance().call({ from: this.account }, (error, result) => {
      this.depositedEthBalance = this.web3.utils.fromWei(result, 'ether');
    });
    // console.log(depositedEthBalance);
  }

}
