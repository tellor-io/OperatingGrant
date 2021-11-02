require("hardhat-gas-reporter");
require('hardhat-contract-sizer');
require("solidity-coverage");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

//const dotenv = require('dotenv').config()
//npx hardhat run scripts/deploy.js --network rinkeby

async function deployTellorOperatingGrant( _network, _pk, _nodeURL) {

    console.log("deploy tellor's vesting operating grant")
    await run("compile")


    var net = _network


    ///////////////Connect to the network
    let privateKey = _pk;
    var provider = new ethers.providers.JsonRpcProvider(_nodeURL) 
    let wallet = new ethers.Wallet(privateKey, provider);


    ////////////////TellorProvider
    console.log("Starting deployment for operating grant contract...")
    const og = await ethers.getContractFactory("contracts/OperatingGrant.sol:OperatingGrant", wallet)
    const ogwithsigner = await og.connect(wallet)
    const tellorOpGrant = await ogwithsigner.deploy()
    console.log("TellorProvider contract deployed to: ", tellorOpGrant.address)

    await tellorOpGrant.deployed()

    if (net == "mainnet"){ 
        console.log("tellorOpGrant contract deployed to:", "https://etherscan.io/address/" + tellorOpGrant.address);
        console.log("   tellorOpGrant transaction hash:", "https://etherscan.io/tx/" + tellorOpGrant.deployTransaction.hash);
    } else if (net == "rinkeby") {
        console.log("tellorOpGrant contract deployed to:", "https://rinkeby.etherscan.io/address/" + tellorOpGrant.address);
        console.log("    tellorOpGrant transaction hash:", "https://rinkeby.etherscan.io/tx/" + tellorOpGrant.deployTransaction.hash);
    } else {
        console.log("Please add network explorer details")
    }

    // Wait for few confirmed transactions.
    // Otherwise the etherscan api doesn't find the deployed contract.
    console.log('waiting for tellorOpGrant tx confirmation...');
    await tellorOpGrant.deployTransaction.wait(3)

    console.log('submitting tellorOpGrant contract for verification...');
    await run("verify:verify",
      {
      address: tellorOpGrant.address
      },
    )
    console.log("tellorOpGrant contract verified")


}


deployTellorOperatingGrant( "rinkeby", process.env.TESTNET_PK, process.env.NODE_URL_RINKEBY)
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});