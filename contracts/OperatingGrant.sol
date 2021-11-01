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
    uint256 public maxAmount;
    address public beneficiary = 0x39e419ba25196794b595b2a595ea8e527ddc9856;
    address public constant tellorAddress = 0x88df592f8eb5d7bd38bfef7deb0fbc02cf3778a0;

    //Events
    event VestedDeposit (uint _amount);
    event TokenWithdrawal (uint _amount);


    constructor () {
        lastReleaseTime = block.timestamp;
    }

    /**
     * @dev Use this function to deposit tokens for vesting
     *
     */
    function updateBeneficiary (address _newBeneficiary) external {
        require(msg.sender == beneficiary, "must be the beneficiary");
        beneficiary = _newBeneficiary;
    } 
    
    /**
     * @dev Use this function to withdraw released tokens
     *
     */
    function withdrawTrb() external {
        uint256 _availableBalance = tellor.balanceOf(address(this));
        if(_availableBalance > maxAmount){
            maxAmount = _availableBalance;
        }
        uint256 _releasedAmount = maxAmount * (block.timestamp - lastReleaseTime)/(86400* 365 * 2);
        if(_releasedAmount > _availableBalance){
            _releasedAmount = _availableBalance;
        }
        lastReleaseTime = block.timestamp;
        ITellor(tellorAddress).transfer(beneficiary, _releasedAmount);
        emit TokenWithdrawal(_releasedAmount);
    }
}