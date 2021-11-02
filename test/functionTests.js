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
        tellor = await ethers.getContractAt("contracts/testing/ITellor.sol", tellorMaster)
        ofac = await ethers.getContractFactory("contracts/OperatingGrant.sol:OperatingGrant");
        operatingGrant = await ofac.deploy();
        await operatingGrant.deployed();
        devWallet = await ethers.provider.getSigner(DEV_WALLET);
        master = await tellor.connect(devWallet)
        await master.transfer(operatingGrant.address,web3.utils.toWei("100"));
    });
    it("test constructor", async function() {

    });
    it("test change Beneficiary", async function() {

    });  
    it("test withdrawFunds", async function() {

    });
    it("test withdrawAllFunds", async function() {

    });
    it("test send more to contract then withdraw", async function() {

    });
    it("test new max in contract then withdraw", async function() {

    });
});
