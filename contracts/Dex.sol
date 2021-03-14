pragma solidity 0.7.1;
pragma experimental ABIEncoderV2;

import "./Owner.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Dex is Owner {
    // contructor

    constructor(address _owner) public Owner(_owner){

    }
    
        // Events ----------------------

    event DepositEth(address from, uint256 amount, uint256 timestamp);
    event WithdrawEth(address to, uint256 amount, uint256 timestamp);
    event DepositToken(
        address from,
        address token,
        uint256 amount,
        uint256 timestamp
    );
    event WithdrawToken(
        address to,
        address token,
        uint256 amount,
        uint256 timestamp
    );
    event TokenAddedToSystem(
        address token,
        string tokenName,
        uint256 timestamp
    );

    // Balances mappings ----------------------

    mapping(address => uint256) balance_eth;
    mapping(address => mapping(address => uint256)) balance_token;

    // Order book Struct ----------------------

    struct Offer {
        uint256 amount;
        address maker;
    }

    struct OrderBook {
        uint256 max_price;
        uint256 low_price;
        mapping(uint256 => Offer) offers;
        uint256 offers_key;
        uint256 offers_length;
    }

    struct Token {
        address token;
        string tokenName;
        //mapping(uint256 => OrderBook) buy_book;
        //mapping(uint256 => OrderBook) sell_book;
        uint256 buy_price;
        uint256 lowest_buy_price;
        uint256 buy_volume;
        uint256 sell_price;
        uint256 highest_sell_price;
        uint256 sell_volume;
    }

    mapping(address => Token) order_book;

    // uint8 order_book_index;

    // Tokens listing functions ----------------------

    function addTokenToDex(address token, string memory tokenName) public {
        // require(order_book[token].token != address(0));
        order_book[token].token = token;
        order_book[token].tokenName = tokenName;
        emit TokenAddedToSystem(token, tokenName, block.timestamp);
    }

    function getTokenListedInDex(address token) public view returns (Token memory) {
        // TODO check not null
        // TODO just admin can call
        // tokenInfo.token = order_book[token].token;
        // tokenInfo.tokenName = order_book[token].tokenName;
        // return tokenInfo;
        Token storage tokenInfo = order_book[token];
        return tokenInfo;
    }

    // Deposit functions ----------------------------

    function depositEth() public payable {
        balance_eth[msg.sender] += msg.value;

        emit DepositEth(msg.sender, msg.value, block.timestamp);
    }

    function withdrawEth(uint256 amount) public {
        require(balance_eth[msg.sender] - amount >= 0);
        balance_eth[msg.sender] -= amount;
        msg.sender.transfer(amount);
        emit WithdrawEth(msg.sender, amount, block.timestamp);
    }

    function getEthBalance() public returns (uint256) {
        return balance_eth[msg.sender];
    }

    function depositToken(address token, uint256 amount) public {
        IERC20 token_instance = IERC20(token);
        require(token_instance.allowance(msg.sender, address(this)) >= amount);
        require(token_instance.transferFrom(msg.sender, address(this), amount));
        balance_token[msg.sender][token] += amount;
        emit DepositToken(msg.sender, token, amount, block.timestamp);
    }

    function withdrawToken(address token, uint256 amount) public {
        IERC20 token_instance = IERC20(token);
        require(balance_token[msg.sender][token] - amount >= 0);
        // TODO check non negative values
        require(
            balance_token[msg.sender][token] - amount <=
                balance_token[msg.sender][token]
        );
        balance_token[msg.sender][token] -= amount;
        require(token_instance.transfer(msg.sender, amount));
        emit WithdrawToken(msg.sender, token, amount, block.timestamp);
    }

    function getTokenBalance(address token) public returns (uint256) {
        return balance_token[msg.sender][token];
    }

    // Orders funtions --------------------------------

    // Buy limit -------------------

    // function buyLimit(
    //     address token,
    //     uint256 priceInWei,
    //     uint256 amount,
    //     address maker
    // ) public {
    //     // 1. Icrease buy offer length
    //     order_book[token].buy_book[priceInWei].offers_length++;
    //     // 2. Add buy offer
    //     order_book[token].buy_book[priceInWei].offers[
    //         order_book[token].buy_book[priceInWei].offers_length
    //     ] = Offer(amount, maker);
    //     // 3. If First order
    //     if (order_book[token].buy_book[priceInWei].offers_length == 1) {
    //         order_book[token].buy_book[priceInWei].offers_key = 1;
    //         order_book[token].buy_volume++;

    //         uint256 currentBuyPrice = order_book[token].buy_price;
    //         uint256 lowestBuyPrice = order_book[token].lowest_buy_price;

    //         if (lowestBuyPrice == 0 || lowestBuyPrice > priceInWei) {
    //             // 3.1 First entry
    //             if (currentBuyPrice == 0) {
    //                 order_book[token].buy_price = priceInWei;
    //                 order_book[token].buy_book[priceInWei]
    //                     .max_price = priceInWei;
    //                 order_book[token].buy_book[priceInWei].low_price = 0;
    //             }
    //         }
    //     }
    // }

    // Order book functios ---------------------

    // function getBuyOrdersBook(address token)
    //     public
    //     view
    //     returns (uint256[] memory, uint256[] memory)
    // {
    //     Token storage loadedToken = order_book[token];
    //     uint256[] memory buyOrderPrices = new uint256[](loadedToken.buy_volume);
    //     uint256[] memory buyOrdersVolume =
    //         new uint256[](loadedToken.buy_volume);

    //     uint256 lowestBuyPrice = loadedToken.lowest_buy_price;
    //     uint256 counter = 0;

    //     if (order_book[token].buy_price > 0) {
    //         while (lowestBuyPrice <= order_book[token].buy_price) {
    //             buyOrderPrices[counter] = lowestBuyPrice;
    //             uint256 priceVolume = 0;
    //             uint256 offers_key =
    //                 loadedToken.buy_book[lowestBuyPrice].offers_key;

    //             while (
    //                 offers_key <=
    //                 loadedToken.buy_book[lowestBuyPrice].offers_length
    //             ) {
    //                 priceVolume += loadedToken.buy_book[lowestBuyPrice].offers[
    //                     offers_key
    //                 ]
    //                     .amount;
    //                 offers_key++;
    //             }

    //             buyOrdersVolume[counter] = priceVolume;

    //             if (
    //                 lowestBuyPrice ==
    //                 loadedToken.buy_book[lowestBuyPrice].max_price
    //             ) {
    //                 break;
    //             } else {
    //                 lowestBuyPrice = loadedToken.buy_book[lowestBuyPrice]
    //                     .max_price;
    //             }
    //             counter++;
    //         }
    //     }
    //     return (buyOrderPrices, buyOrdersVolume);
    // }
}
