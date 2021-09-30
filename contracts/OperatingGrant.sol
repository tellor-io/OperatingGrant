// SPDX-License-Identifier: MIT
pragma solidity 0.8.3;

import "../interfaces/ITellor.sol";

/**
 @author Tellor Inc.
 @title OperatingGrant
 @dev This contract allows the Tellor team to receive a grant to fund operations.
*/
contract OparatingGrant {
    //Storage
    uint256 public lastReleaseTime;
    address public beneficiary;
    address public tellorAddress;
    ITellor public tellor;

    //Events
    event VestedDeposit (uint _amount);
    event TokenWithdrawal (uint _amount);


    constructor (address _beneficiary, address payable _tellorAddress) {
        beneficiary = _beneficiary;
        lastReleaseTime = block.timestamp;
        tellor = ITellor(_tellorAddress); 
    }

    /**
     * @dev Use this function to deposit tokens for vesting
     *
     */
    function updateBeneficiary (address _newBeneficiary) external {
        require(msg.sender == beneficiary);
        beneficiary = _newBeneficiary;
    } 
     
    /**
     * @dev Use this function to deposit tokens for vesting
     *
     */
    function depositTrb (uint _amount) external payable {
        tellor.transfer(beneficiary, _amount);
        emit VestedDeposit (_amount);
    }
    
    /**
     * @dev Use this function to withdraw released tokens
     *
     */
    function withdrawTrb(uint _amount) external {
        require(msg.sender == beneficiary); 
        uint _availableBalance = tellor.balanceOf(address(this));       
        require(_amount <= _availableBalance);
        uint _releasedAmount = (block.timestamp - lastReleaseTime)/300;
        require(_amount <= _releasedAmount);
        lastReleaseTime = block.timestamp;
        tellor.transfer(beneficiary, _amount);
        emit TokenWithdrawal(_amount);
    }

    /**  
     * @dev allow contract to receive funds  
     */  
    fallback() external payable {} 

}