const hre  = require('hardhat')
const getSafeSingleton = async () => {
  const Safe = await hre.ethers.getContractFactory("Safe");
  const safe = await Safe.deploy()
  return Safe.attach(safe.address);

};

const getFactory = async () => {
  const Factory = await hre.ethers.getContractFactory("SafeProxyFactory");
  const  factory = await Factory.deploy()
  return Factory.attach(factory.address);

};

const getSafeTemplate = async (saltNumber = getRandomIntAsString()) => {
  const singleton = await getSafeSingleton();
  const factory = await getFactory();
  const template = await factory.callStatic.createProxyWithNonce(singleton.address, "0x", saltNumber);
  await factory.createProxyWithNonce(singleton.address, "0x", saltNumber).then((tx) => tx.wait());
  const Safe = await hre.ethers.getContractFactory("Safe");
  return Safe.attach(template);

};

const getRandomInt = (min = 0, max = Number.MAX_SAFE_INTEGER) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomIntAsString = (min = 0, max = Number.MAX_SAFE_INTEGER)  => {
  return getRandomInt(min, max).toString();
};

module.exports.getSafeTemplate = getSafeTemplate
