import { Component, OnInit } from '@angular/core';
import Web3 from 'web3';
import Dex from "build/contracts/Dex.json";
import { Pair } from '../models/pair';

declare let window: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public pairs: Pair[] = [];

  public web3;
  public networkId;
  public account;
  public balance;
  public depositedEthBalance;
  public ethInput_deposit;
  public ethInput_withdraw;
  public dexContract;

  DAI_TOKEN_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  TETHER_TOKEN_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

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
      await this.loadBlockChainData();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      await this.loadBlockChainData();
    } else {
      window.alert('No Metamask detected');
    }
  }

  async loadBlockChainData() {
    console.log("loadBlockChainData()")
    this.web3 = window.web3;
    this.networkId = await this.web3.eth.net.getId();
    const accounts = await this.web3.eth.getAccounts();
    this.account = accounts[0];
    const balance = await this.web3.eth.getBalance(this.account);
    this.balance = this.web3.utils.fromWei(balance, 'ether');
    await this.initAbisContracts();
    await this.getEthBalance();
    await this.getTokenListedInDex();
  }

  initAbisContracts() {
    const DexContract = Dex.networks[this.networkId];
    if (DexContract) {
      this.dexContract = new this.web3.eth.Contract(Dex.abi, DexContract.address);
      console.log(this.dexContract);
    }
  }

  // MOVED to migrations
  // async listToken() {
  //   await this.dexContract.methods.addTokenToDex(this.DAI_TOKEN_ADDRESS, "DAI").call({ from: this.account },
  //     (error, result) => {
  //       console.log(error)
  //       console.log(result)
  //     });
  // }

  async getTokenListedInDex() {
    const addresses = [this.DAI_TOKEN_ADDRESS, this.TETHER_TOKEN_ADDRESS];
    for (let i: number = 0; i < addresses.length; i++) {
      await this.dexContract.methods.getTokenListedInDex(addresses[i]).call({ from: this.account },
        (error, result) => {
          this.pairs.push({ name: result.tokenName, address: result.token } as Pair)
          console.log(error);
          console.log(result);
          console.log(this.pairs);
        });
    }
  }

  async depositEth() {
    const ethInputToUint = this.web3.utils.toWei(this.ethInput_deposit, 'ether');
    this.dexContract.methods
      .depositEth()
      .send({ value: ethInputToUint, from: this.account })
      .on("transactionHsh", async (hash) => {
        console.log("depositEth()");
        await this.loadBlockChainData();
        await this.getEthBalance();
      });
  }

  withdrawEth() {
    const ethInputToUint = this.web3.utils.toWei(this.ethInput_withdraw, 'ether');
    this.dexContract.methods
      .withdrawEth(ethInputToUint)
      .send({ from: this.account })
      .on("transactionHash", async (hash) => {
        await this.loadBlockChainData();
        await this.getEthBalance();
      });
  }

  async getEthBalance() {
    await this.dexContract.methods.getEthBalance().call({ from: this.account }, (error, result) => {
      console.log(this.account)
      console.log(error)
      console.log(result)
      if (result !== undefined) {
        this.depositedEthBalance = this.web3.utils.fromWei(result.toString(), 'ether');
      }
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
