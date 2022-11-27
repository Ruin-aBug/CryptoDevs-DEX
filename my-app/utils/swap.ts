import { Web3Provider, JsonRpcSigner } from "@ethersproject/providers";
import { BigNumber, Contract } from "ethers";
import { EXCHANGE_CONTRACT_ABI, EXCHANGE_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_ADDRESS } from "../constants";
export async function getAmountOfTokensReceivedFromSwap(
	provider: Web3Provider | JsonRpcSigner,
	swapAmountWei: BigNumber,
	ethSelected: boolean,
	ethBalance: BigNumber,
	reserveCD: BigNumber
): Promise<BigNumber> {
	const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, provider);
	let amountOfTokens: BigNumber;
	if (ethSelected) {
		amountOfTokens = await exchangeContract.getAmountOfTokens(swapAmountWei, ethBalance, reserveCD);
	} else {
		amountOfTokens = await exchangeContract.getAmountOfTokens(swapAmountWei, reserveCD, ethBalance);
	}
	return amountOfTokens;
}

export async function swapTokens(
	signer: JsonRpcSigner,
	swapAmountWei: BigNumber,
	tokenToBeReceivedAfterSwap: BigNumber,
	ethSelected: boolean
) {
	const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, signer);
	const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer);
	let tx;
	if (ethSelected) {
		tx = await exchangeContract.ethToCryptoDevToken(
			tokenToBeReceivedAfterSwap,
			{
				value: swapAmountWei
			}
		);
		await tx.wait();
	} else {
		tx = await tokenContract.approve(
			EXCHANGE_CONTRACT_ADDRESS,
			swapAmountWei
		);
		await tx.wait();
		tx = await exchangeContract.cryptoDevTokenToEth(
			swapAmountWei,
			tokenToBeReceivedAfterSwap
		)
		await tx.wait();
	}
}