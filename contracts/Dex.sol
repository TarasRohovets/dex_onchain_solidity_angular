pragma solidity 0.7.1;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Dex {
    // Events

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

    // Balances

    mapping(address => uint256) balance_eth;
    mapping(address => mapping(address => uint256)) balance_token;

    // Order book

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
        mapping(uint256 => OrderBook) buy_book;
        mapping(uint256 => OrderBook) sell_book;
        uint256 buy_price;
        uint256 lowest_buy_price;
        uint256 buy_volume;
        uint256 sell_price;
        uint256 highest_sell_price;
        uint256 sell_volume;
    }

    mapping(uint8 => Token) order_book;

    // Deposit

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
}
