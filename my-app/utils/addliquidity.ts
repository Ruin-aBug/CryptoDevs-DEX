import { JsonRpcSigner } from "@ethersproject/providers";
import { BigNumber, Contract, utils } from "ethers";
import { EXCHANGE_CONTRACT_ABI, EXCHANGE_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_ADDRESS } from "../constants";

export async function addLiquidity(signer: JsonRpcSigner, addCDAmountWei: BigNumber, addETHAmountWei: BigNumber) {
	try {
		const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer);
		const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, signer);
		let txn = await tokenContract.approve(EXCHANGE_CONTRACT_ADDRESS, addCDAmountWei);
		await txn.wait();
		txn = await exchangeContract.addLiquidit(addCDAmountWei, { value: addETHAmountWei });
		await txn.wait();
	} catch (e) {
		console.error(e);
	}
}

export async function calculateCD(etherBalanceContract: BigNumber, cdTokenReserve: BigNumber, _addEther: string = "0"): Promise<BigNumber> {
	const _addEtherAmountWei = utils.parseEther(_addEther);
	const cryptoDevTokenAmount = _addEtherAmountWei.mul(cdTokenReserve).div(etherBalanceContract);
	return cryptoDevTokenAmount;
}