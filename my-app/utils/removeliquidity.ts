import { Web3Provider, JsonRpcSigner } from "@ethersproject/providers"
import { BigNumber, Contract } from "ethers";
import { EXCHANGE_CONTRACT_ABI, EXCHANGE_CONTRACT_ADDRESS } from "../constants";

export async function removeLiquidity(signer: JsonRpcSigner, removeLPWei: BigNumber) {
	try {
		const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, signer);
		const tx = await exchangeContract.removeLiquidity(removeLPWei);
		await tx.wait();
	} catch (e) {
		console.error(e);
	}
}

export async function getTokensAfterRemove(provider: Web3Provider | JsonRpcSigner, removeLPWei: BigNumber, ethBalance: BigNumber, tokenReserve: BigNumber) {
	try {
		const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, provider);
		const totalSupply = await exchangeContract.totalSupply() as BigNumber;
		const removeEther = ethBalance.mul(removeLPWei).div(totalSupply);
		const removeCD = tokenReserve.mul(removeLPWei).div(totalSupply);
		return { removeEther, removeCD };
	} catch (e) {
		console.error(e);
	}
}