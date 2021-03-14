pragma solidity 0.7.1;

contract Owner {
    address public owner;
    address public nominated;

    // events
    event OwnerNominated(address newOwner);
    event OwnerChanged(address oldOwner, address newOwner);

    // modifiers
    modifier onlyOwner {
        _onlyOwner();
        _;
    }

    function _onlyOwner() private view {
        require(msg.sender == owner, "Not allowed, contract doesnt belong to you"); 
    }

    constructor(address _owner) public {
        require(_owner != address(0), "adress cant be 0");
        owner = _owner;
        emit OwnerChanged(address(0), _owner);
    }

    function nominateNewOwner(address _owner) external onlyOwner {
        nominated = _owner;
        emit OwnerNominated(_owner);
    }

    function acceptOwnershit() external {
        require(msg.sender == nominated, "You must be nominated before you accept");
        emit OwnerChanged(owner, nominated);
        owner = nominated;
        nominated = address(0);
    }
}