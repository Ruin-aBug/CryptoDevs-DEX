import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CRYPTODEV_TOKEN_ADDRESS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { deployments, getNamedAccounts, getChainId } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

	const exchange = await deploy("Exchange", {
		from: deployer,
		log: true,
		args: [CRYPTODEV_TOKEN_ADDRESS],
	});

	console.log("exchange address:", exchange.address);
	const chainId = await getChainId();
	if (chainId !== "31337") {
		await hre.run("verify:verify", {
			address: exchange.address,
			constructorArguments: [CRYPTODEV_TOKEN_ADDRESS],
		})
	}
}
export default func;
func.tags = ["dex"];