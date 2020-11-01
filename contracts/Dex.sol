pragma solidity 0.7.1;

contract Dex {
    // Events
    event DepositEth(address from, uint256 amount, uint256 timestamp);
    event WithdrawEth(address to, uint256 amount, uint256 timestamp);
    // Balances
    mapping(address => uint256) balance_eth;
    mapping(address => mapping(address => uint256)) balance_token;

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

    function depositToken() public {}

    function withdrawToken() public {}

    function getTokenBalance() public {}
}
