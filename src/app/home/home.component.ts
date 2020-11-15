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
  ethInput_deposit;
  ethInput_withdraw;
  dexContract;

  DAI_TOKEN_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

  //buy orders
  buyLimit_ethInput_amount;
  buyLimit_ethInput_price: string;

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
    const balance = await this.web3.eth.getBalance(this.account);
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

  async listToken(){
    await this.dexContract.methods.addTokenToDex(this.DAI_TOKEN_ADDRESS, "DAI").call({from: this.account}, 
      (error, result) => {
        console.log(error)
        console.log(result)
      });
  }

  async getTokenListedInDex(){
    await this.dexContract.methods.getTokenListedInDex(this.DAI_TOKEN_ADDRESS).call({from: this.account}, 
      (error, result) => {
        console.log(error)
        console.log(result)
      });
  }

  depositEth() {
    const ethInputToUint = this.web3.utils.toWei(this.ethInput_deposit, 'ether');
    this.dexContract.methods
      .depositEth()
      .send({ value: ethInputToUint, from: this.account })
      .on("transactionHsh", (hash) => {
        console.log("depositEth()");
        this.loadBlockChainData();
        this.getEthBalance();
      });
  }

  withdrawEth() {
    const ethInputToUint = this.web3.utils.toWei(this.ethInput_withdraw, 'ether');
    this.dexContract.methods
      .withdrawEth(ethInputToUint)
      .send({ from: this.account })
      .on("transactionHash", (hash) => {
        this.loadBlockChainData();
        this.getEthBalance();
      });
  }

  async getEthBalance() {
    await this.dexContract.methods.getEthBalance().call({ from: this.account }, (error, result) => {
      console.log(result)
      this.depositedEthBalance = this.web3.utils.fromWei(result, 'ether');
    });
  }

  async buyLimit() {
    const buyLimitInput = this.web3.utils.toWei(this.buyLimit_ethInput_amount, 'ether');
    await this.dexContract.methods.buyLimit(this.DAI_TOKEN_ADDRESS,
      this.buyLimit_ethInput_price,
      buyLimitInput,
      this.account).call({ from: this.account }, (error, result) => {
        console.log(error)
        console.log(result)
      });
  }

  async getBuyOrderBook() {
    await this.dexContract.methods.getBuyOrdersBook(this.DAI_TOKEN_ADDRESS).call({ from: this.account }, (error, result) => {
     console.log(result);
    });
  }

}
