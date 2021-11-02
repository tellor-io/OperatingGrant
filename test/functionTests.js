const { AbiCoder } = require("@ethersproject/abi");
const { expect } = require("chai");
const h = require("./helpers/helpers");
var assert = require('assert');
const web3 = require('web3');
const fetch = require('node-fetch')

describe("TellorX Function Tests", function() {

    const tellorMaster = "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0"
    const DEV_WALLET = "0x39E419bA25196794B595B2a595Ea8E527ddC9856"
    let accounts = null
    let grantContract,tellor,ofac;
    let run = 0;
    let mainnetBlock = 0;

    beforeEach("deploy and setup TellorX", async function() {
        this.timeout(20000000)
        if(run == 0){
        const directors = await fetch('https://api.blockcypher.com/v1/eth/main').then(response => response.json());
        mainnetBlock = directors.height - 20;
        console.log("     Forking from block: ",mainnetBlock)
        run = 1;
        }
        accounts = await ethers.getSigners();
        await hre.network.provider.request({
        method: "hardhat_reset",
        params: [{forking: {
                jsonRpcUrl: hre.config.networks.hardhat.forking.url,
                blockNumber: mainnetBlock
            },},],
        });
        await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [DEV_WALLET]}
        )
        tellor = await ethers.getContractAt("contracts/testing/ITellor.sol:ITellor", tellorMaster)
        ofac = await ethers.getContractFactory("contracts/OperatingGrant.sol:OperatingGrant");
        operatingGrant = await ofac.deploy();
        await operatingGrant.deployed();
        devWallet = await ethers.provider.getSigner(DEV_WALLET);
        operatingGrant = await operatingGrant.connect(devWallet)
        master = await tellor.connect(devWallet)
        await master.transfer(operatingGrant.address,web3.utils.toWei("100"));
    });
    it("test constructor", async function() {
        assert(await operatingGrant.maxAmount() == 0, "operating grant should be correct")
        assert(await operatingGrant.lastReleaseTime() > 0, "lastReleaseTime should be correct")
        assert(await operatingGrant.beneficiary() == "0x39E419bA25196794B595B2a595Ea8E527ddC9856", "beneficiary should be correct")
        assert(await operatingGrant.tellorAddress() == "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0", "tellorAddress should be correct")
    });
    it("test change Beneficiary", async function() {
        await operatingGrant.updateBeneficiary(accounts[1].address);
        assert(await operatingGrant.beneficiary() == accounts[1].address, "new beneficiary should be correct")
        let bal1 = await master.balanceOf(accounts[1].address)
        await operatingGrant.withdrawTrb();
        let bal2 = await master.balanceOf(accounts[1].address)
        assert(bal2 > bal1, "beneficiary address should be changed")
    });  
    it("test withdrawFunds", async function() {
        let bal1 = await master.balanceOf(DEV_WALLET)
        await h.advanceTime(86400 * 365)
        await operatingGrant.withdrawTrb();
        let bal2 = await master.balanceOf(DEV_WALLET)
        assert(ethers.utils.formatEther(bal2) - ethers.utils.formatEther(bal1) >= 50, "beneficiary balance should be changed properly")
        assert(ethers.utils.formatEther(bal2) - ethers.utils.formatEther(bal1) < 51, "beneficiary balance should be correct")
    });
    it("test withdrawAllFunds", async function() {
        let bal1 = await master.balanceOf(DEV_WALLET)
        await h.advanceTime(86400 * 365* 3)
        await operatingGrant.withdrawTrb();
        let bal2 = await master.balanceOf(DEV_WALLET)
        assert(ethers.utils.formatEther(bal2) - ethers.utils.formatEther(bal1) == 100, "beneficiary balance should be changed properly")
    });
    it("test send more to contract then withdraw", async function() {
        await h.advanceTime(86400 * 365)
        await operatingGrant.withdrawTrb();
        await master.transfer(operatingGrant.address,web3.utils.toWei("50"));
        let bal1 = await master.balanceOf(DEV_WALLET)
        await h.advanceTime(86400 * 365)
        await operatingGrant.withdrawTrb();
        let bal2 = await master.balanceOf(DEV_WALLET)
        assert(ethers.utils.formatEther(bal2) - ethers.utils.formatEther(bal1) >= 50, "beneficiary balance should be changed properly")
        assert(ethers.utils.formatEther(bal2) - ethers.utils.formatEther(bal1) < 51, "beneficiary balance should be correct")
        assert(await master.balanceOf(operatingGrant.address) > web3.utils.toWei("49"))
        assert(await master.balanceOf(operatingGrant.address) < web3.utils.toWei("51"))
    });
    it("test new max in contract then withdraw", async function() {
        await h.advanceTime(86400 * 365)
        await operatingGrant.withdrawTrb();
        await master.transfer(operatingGrant.address,web3.utils.toWei("150"));
        let bal1 = await master.balanceOf(DEV_WALLET)
        await h.advanceTime(86400 * 365)
        await operatingGrant.withdrawTrb();
        let bal2 = await master.balanceOf(DEV_WALLET)
        assert(ethers.utils.formatEther(bal2) - ethers.utils.formatEther(bal1) >= 100, "beneficiary balance should be changed properly")
        assert(ethers.utils.formatEther(bal2) - ethers.utils.formatEther(bal1) < 101, "beneficiary balance should be correct")
        let bal = await master.balanceOf(operatingGrant.address)
        assert(ethers.utils.formatEther(bal) > 99, "operating Grant address should be correct")
        assert(ethers.utils.formatEther(bal) < 101, "operating grant address should be correct 2")
    });
});
