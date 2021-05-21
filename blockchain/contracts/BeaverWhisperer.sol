// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

contract BeaverWhisperer {
    string public beaverSays;
    address public owner;
    address payable public creator;
    uint256 public lastSaleAmount;

    constructor(string memory _beaverSays) {
        beaverSays = _beaverSays;

        creator = payable(msg.sender);
        owner = msg.sender;
    }

    function buy() public payable {
        require(msg.value > lastSaleAmount, "You are cheap! Pay more!");

        owner = msg.sender;
        lastSaleAmount = msg.value;
    }

    function setBeaverSays(string memory text) public {
        require(msg.sender == owner, "You are NOT my owner!");

        beaverSays = text;
    }

    function claim() public {
        require(msg.sender == creator, "You are not the creator!");

        creator.transfer(address(this).balance);
    }

    function finalize() public {
        require(msg.sender == creator, "You are not the creator!");

        selfdestruct(creator);
    }
}
