const beaverWhisperer = artifacts.require("BeaverWhisperer");

module.exports = function (deployer) {
  deployer.deploy(beaverWhisperer, 'Dam it');
};
