
const deploy  = async function (hre) {
    const { deployments, getNamedAccounts } = hre;
    const { deployer } = await getNamedAccounts();
    const { deploy } = deployments;

    await deploy("Safe", {
        from: deployer,
        args: [],
        log: true,
        deterministicDeployment: true,
    });
};

deploy.tags = ["singleton", "main-suite"];
module.exports.deploy = deploy
