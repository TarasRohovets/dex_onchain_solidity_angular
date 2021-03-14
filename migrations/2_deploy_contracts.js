const Dex = artifacts.require("Dex");

module.exports = async function (deployer, network, accounts) {
  
  const user = accounts[0];
  await deployer.deploy(Dex, user);
  const dex = await Dex.deployed();

  const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const daiTokenName = "DAI";
  const tetherTokenAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  const tetherTokenName = "Tether";

  await dex.addTokenToDex(daiTokenAddress, daiTokenName);
  await dex.addTokenToDex(tetherTokenAddress, tetherTokenName);
};
