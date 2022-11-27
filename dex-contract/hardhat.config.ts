import * as dotenv from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-toolbox";

dotenv.config();

const proxyUrl = "http://192.168.31.42:7890"; // change to yours, With the global proxy enabled, change the proxyUrl to your own proxy link. The port may be different for each client.
import { ProxyAgent, setGlobalDispatcher } from "undici";
const proxyAgent = new ProxyAgent(proxyUrl);
setGlobalDispatcher(proxyAgent);

const goerli_url = process.env.GOERLI_RPC_URL || "";
const bsc_test_url = process.env.BSC_TEST_RPC_URL || "";
const mumbai_url = process.env.POLYGON_TEST_RPC_URL || "";
const accounts = process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [];
const etherscan_key = process.env.ETHERSCAN_API_KEY || "";
const bscscan_key = process.env.BSCSCAN_API_KEY || "";
const polygonscan_key = process.env.POLYGONSCAN_API_KEY || "";
const coinmarket_api_key = process.env.COINMARKETCAP_API_KEY || "";

const config: HardhatUserConfig = {
	namedAccounts: {
		deployer: 0,
	},
	typechain: {
		outDir: "types",
		target: "ethers-v5",
	},
	paths: {
		sources: "contracts",
	},
	solidity: {
		compilers: [{
			version: "0.8.17",
			settings: {
				optimizer: {
					enabled: true,
					runs: 200,
				}
			}
		}]
	},
	defaultNetwork: "hardhat",
	networks: {
		hardhat: {
			chainId: 31337,
			saveDeployments: true,
			// live: true,
			forking: {
				url: mumbai_url,
				blockNumber: 28822087,
				enabled: true,
			},
		},
		goerli: {
			url: goerli_url,
			accounts: accounts,
			chainId: 5,
			live: true,
			saveDeployments: true,
		},
	},
	etherscan: {
		//hardhat-etherscan
		// apiKey: etherscan_key,
		apiKey: {
			goerli: etherscan_key,
			bsctest: bscscan_key,
			mumbai: polygonscan_key,
		},
		//如果是主网则不需要配置customChains
		customChains: [
			{
				network: "goerli",
				chainId: 5,
				urls: {
					apiURL: "https://api-goerli.etherscan.io/api",
					browserURL: "https://goerli.etherscan.io/",
				},
			},
			{
				network: "bsctest",
				chainId: 97,
				urls: {
					apiURL: "https://api-testnet.bscscan.com/api",
					browserURL: "https://testnet.bscscan.com/",
				},
			},
			{
				network: "mumbai",
				chainId: 80001,
				urls: {
					apiURL: "https://api-testnet.polygonscan.com/api",
					browserURL: "https://mumbai.polygonscan.com/",
				},
			},
		],
	},
	gasReporter: {
		enabled: true,
		outputFile: "gas-reporter.txt",
		noColors: true,
		currency: "USD",
		coinmarketcap: coinmarket_api_key,
		token: "ETH",
	},
};

export default config;
