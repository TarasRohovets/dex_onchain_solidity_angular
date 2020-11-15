const Dex = artifacts.require("Dex");

module.exports = async function (deployer) {
  await deployer.deploy(Dex);
  // const dex = await Dex.deployed();

  // const daiToeknAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  // const daiTokenName = "DAI";

  // await dex.addTokenToDex(daiToeknAddress, daiTokenName);
};
