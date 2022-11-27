import { Web3Provider, JsonRpcSigner } from "@ethersproject/providers";
import { BigNumber, Contract } from "ethers";
import { EXCHANGE_CONTRACT_ABI, EXCHANGE_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_ADDRESS } from "../constants";

export async function getEtherBalance(provider: Web3Provider | JsonRpcSigner, address: string, isContract: boolean = false): Promise<BigNumber> {
	try {
		if (isContract) {
			const balance = await provider.getBalance(EXCHANGE_CONTRACT_ADDRESS);
			return balance;
		} else {
			const balance = await provider.getBalance(address);
			return balance;
		}
	} catch (e) {
		console.error(e);
		return BigNumber.from(0);
	}
}

export async function getCDTokenBalance(provider: Web3Provider | JsonRpcSigner, address: string): Promise<BigNumber | undefined> {
	try {
		const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider);
		const balance = await tokenContract.balanceOf(address) as BigNumber;
		return balance;
	} catch (e) {
		console.error(e);
	}
}

export async function getLPTokenBalance(provider: Web3Provider | JsonRpcSigner, address: string): Promise<BigNumber | undefined> {
	try {
		const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, provider);
		const balance = await exchangeContract.balanceOf(address) as BigNumber;
		return balance;
	} catch (e) {
		console.error(e);
	}
}

export async function getReserveOfCDTokens(provider: Web3Provider | JsonRpcSigner): Promise<BigNumber | undefined> {
	try {
		const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, provider);
		const reserve = await exchangeContract.getReserve() as BigNumber;
		return reserve;
	} catch (e) {
		console.error(e);
	}
}