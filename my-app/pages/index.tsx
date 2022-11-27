import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import Web3Modal from "web3modal";
import { BigNumber, providers, utils } from "ethers";
import { Web3Provider, JsonRpcSigner } from "@ethersproject/providers";
import { useEffect, useRef, useState } from 'react';
import { getCDTokenBalance, getEtherBalance, getLPTokenBalance, getReserveOfCDTokens } from '../utils/getAmount';
import { getAmountOfTokensReceivedFromSwap, swapTokens } from '../utils/swap';
import { addLiquidity, calculateCD } from '../utils/addliquidity';
import { getTokensAfterRemove, removeLiquidity } from '../utils/removeliquidity';


export default function Home() {
	const zero = BigNumber.from(0);
	const [loading, setLoading] = useState<boolean>(false);
	const [liquidityTab, setLiquidityTab] = useState<boolean>(true);
	const [ethBalance, setEtherBalance] = useState<BigNumber>(zero);
	const [reservedCD, setReservedCD] = useState<BigNumber>(zero);
	const [etherBalanceContract, setEtherBalanceContract] = useState<BigNumber>(zero);
	const [cdBalance, setCDBalance] = useState<BigNumber>(zero);
	const [lpBalance, setLPBalance] = useState<BigNumber>(zero);
	const [addEther, setAddEther] = useState<string>(zero.toString());
	const [addCDTokens, setAddCDTokens] = useState<BigNumber>(zero);
	const [removeEther, setRemoveEther] = useState<BigNumber>(zero);
	const [removeCD, setRemoveCD] = useState<BigNumber>(zero);
	const [removeLPTokens, setRemoveLPTokens] = useState<string>("0");
	const [swapAmount, setSwapAmount] = useState<string>("0");
	const [tokenToBeReceivedAfterSwap, settokenToBeReceivedAfterSwap] = useState<BigNumber>(zero);
	const [ethSelected, setEthSelected] = useState<boolean>(true);

	const [walletConnected, setWalletConnected] = useState(false);

	const web3ModalRef = useRef<Web3Modal>();

	async function getProviderOrSigner(isSigner: boolean = false): Promise<Web3Provider | JsonRpcSigner> {
		const provider = await web3ModalRef.current?.connect();
		const web3Provider = new providers.Web3Provider(provider);
		const { chainId } = await web3Provider.getNetwork();
		if (chainId !== 5) {
			window.alert("change network to goerli!");
			throw new Error("change network to goerli");
		}
		if (isSigner) {
			const signer = web3Provider.getSigner();
			return signer;
		}
		return web3Provider;
	}

	async function getAmounts() {
		try {
			const provider = await getProviderOrSigner();
			const signer = await getProviderOrSigner(true) as JsonRpcSigner;
			const address = await signer.getAddress();

			const _ethBalance = await getEtherBalance(provider, address);
			const _cdBalance = await getCDTokenBalance(provider, address);
			const _lpBalance = await getLPTokenBalance(provider, address);
			const _reservedCD = await getReserveOfCDTokens(provider);
			console.log(_cdBalance);

			const _ethBalanceContract = await getEtherBalance(provider, "", true);
			setEtherBalance(_ethBalance);
			setCDBalance(_cdBalance!);
			setLPBalance(_lpBalance!);
			setReservedCD(_reservedCD!);
			setEtherBalanceContract(_ethBalanceContract);
		} catch (e) {
			console.error(e);
		}
	}

	async function _swapTokens() {
		try {
			const swapAmountWei = utils.parseEther(swapAmount);
			if (!swapAmountWei.eq(zero)) {
				const signer = await getProviderOrSigner(true) as JsonRpcSigner;
				setLoading(true);
				await swapTokens(signer, swapAmountWei, tokenToBeReceivedAfterSwap, ethSelected);
				setLoading(false);

				await getAmounts();
				setSwapAmount("");
			}
		} catch (e) {
			console.error(e);
			setLoading(false);
			setSwapAmount("");
		}
	}

	async function _getAmountOfTokensReceivedFromSwap(_swapAmounts: string | number) {
		try {
			const _swapAmountsWei = utils.parseEther(_swapAmounts.toString());
			if (!_swapAmountsWei.eq(zero)) {
				const provider = await getProviderOrSigner();
				const _ethBalance = await getEtherBalance(provider, "", true);
				const amountOfTokens = await getAmountOfTokensReceivedFromSwap(
					provider,
					_swapAmountsWei,
					ethSelected,
					_ethBalance,
					reservedCD
				);
				settokenToBeReceivedAfterSwap(amountOfTokens);
			} else {
				settokenToBeReceivedAfterSwap(zero);
			}
		} catch (e) {
			console.error(e);
		}
	}

	async function _addLiquidity() {
		try {
			const addEtherWei = utils.parseEther(addEther.toString());
			if (!addEtherWei.eq(zero) && !addCDTokens.eq(zero)) {
				const signer = await getProviderOrSigner(true);
				setLoading(true);
				await addLiquidity(signer as JsonRpcSigner, addCDTokens, addEtherWei);
				setLoading(false);
				await getAmounts();
			} else {
				setAddCDTokens(zero);
			}
		} catch (e) {
			console.error(e);
			setLoading(false);
			setAddCDTokens(zero);
		}
	}

	async function _removeLiquidity() {
		try {
			const signer = await getProviderOrSigner(true);
			const removeLPTokensWei = utils.parseEther(removeLPTokens);
			setLoading(true);
			await removeLiquidity(signer as JsonRpcSigner, removeLPTokensWei);
			setLoading(false);
			await getAmounts();
			setRemoveEther(zero);
			setRemoveCD(zero);
		} catch (e) {
			console.error(e);
			setLoading(false);
			setRemoveCD(zero);
			setRemoveEther(zero);
		}
	}

	async function _getTokensAfterRemove(_removeLpTokens: string) {
		try {
			const provider = await getProviderOrSigner();
			const removeLpTokenWei = utils.parseEther(_removeLpTokens);
			const _ethBalance = await getEtherBalance(provider, "", true);
			const tokenReserve = await getReserveOfCDTokens(provider);
			const remove = await getTokensAfterRemove(provider, removeLpTokenWei, _ethBalance, tokenReserve!);
			setRemoveEther(remove?.removeEther!);
			setRemoveCD(remove?.removeCD!);
		} catch (e) {
			console.error(e);
		}
	}

	async function connectWallet() {
		try {
			await getProviderOrSigner();
			setWalletConnected(true);
		} catch (e) {
			console.error(e);
		}
	}

	useEffect(() => {
		if (!walletConnected) {
			web3ModalRef.current = new Web3Modal({
				network: "goerli",
				providerOptions: {},
				disableInjectedProvider: false
			});
			connectWallet();
			getAmounts();
		}
	}, [walletConnected]);

	function renderButton() {
		if (!walletConnected) {
			return (
				<button onClick={connectWallet} className={styles.button}>
					Connect your wallet
				</button>
			);
		}

		if (loading) {
			return <button className={styles.button}>Loading...</button>;
		}

		if (liquidityTab) {
			return (
				<div>
					<div className={styles.description}>
						You have:
						<br />
						{/* Convert the BigNumber to string using the formatEther function from ethers.js */}
						{utils.formatEther(cdBalance)} Crypto Dev Tokens
						<br />
						{utils.formatEther(ethBalance)} Ether
						<br />
						{utils.formatEther(lpBalance)} Crypto Dev LP tokens
					</div>
					<div>
						{/* If reserved CD is zero, render the state for liquidity zero where we ask the user
				  how much initial liquidity he wants to add else just render the state where liquidity is not zero and
				  we calculate based on the `Eth` amount specified by the user how much `CD` tokens can be added */}
						{utils.parseEther(reservedCD.toString()).eq(zero) ? (
							<div>
								<input
									type="number"
									placeholder="Amount of Ether"
									onChange={(e) => setAddEther(e.target.value || "0")}
									className={styles.input}
								/>
								<input
									type="number"
									placeholder="Amount of CryptoDev tokens"
									onChange={(e) =>
										setAddCDTokens(
											BigNumber.from(utils.parseEther(e.target.value || "0"))
										)
									}
									className={styles.input}
								/>
								<button className={styles.button1} onClick={_addLiquidity}>
									Add
								</button>
							</div>
						) : (
							<div>
								<input
									type="number"
									placeholder="Amount of Ether"
									onChange={async (e) => {
										setAddEther(e.target.value || "0");
										// calculate the number of CD tokens that
										// can be added given  `e.target.value` amount of Eth
										const _addCDTokens = await calculateCD(
											etherBalanceContract,
											reservedCD,
											e.target.value || "0"
										);
										setAddCDTokens(_addCDTokens);
									}}
									className={styles.input}
								/>
								<div className={styles.inputDiv}>
									{/* Convert the BigNumber to string using the formatEther function from ethers.js */}
									{`You will need ${utils.formatEther(addCDTokens)} Crypto Dev
						Tokens`}
								</div>
								<button className={styles.button1} onClick={_addLiquidity}>
									Add
								</button>
							</div>
						)}
						<div>
							<input
								type="number"
								placeholder="Amount of LP Tokens"
								onChange={async (e) => {
									setRemoveLPTokens(e.target.value || "0");
									// Calculate the amount of Ether and CD tokens that the user would receive
									// After he removes `e.target.value` amount of `LP` tokens
									await _getTokensAfterRemove(e.target.value || "0");
								}}
								className={styles.input}
							/>
							<div className={styles.inputDiv}>
								{/* Convert the BigNumber to string using the formatEther function from ethers.js */}
								{`You will get ${utils.formatEther(removeCD)} Crypto
					Dev Tokens and ${utils.formatEther(removeEther)} Eth`}
							</div>
							<button className={styles.button1} onClick={_removeLiquidity}>
								Remove
							</button>
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<div>
					<input
						type="number"
						placeholder="Amount"
						onChange={async (e) => {
							setSwapAmount(e.target.value || "");
							// Calculate the amount of tokens user would receive after the swap
							await _getAmountOfTokensReceivedFromSwap(e.target.value || "0");
						}}
						className={styles.input}
						value={swapAmount}
					/>
					<select
						className={styles.select}
						name="dropdown"
						id="dropdown"
						onChange={async () => {
							setEthSelected(!ethSelected);
							// Initialize the values back to zero
							await _getAmountOfTokensReceivedFromSwap(0);
							setSwapAmount("");
						}}
					>
						<option value="eth">Ethereum</option>
						<option value="cryptoDevToken">Crypto Dev Token</option>
					</select>
					<br />
					<div className={styles.inputDiv}>
						{/* Convert the BigNumber to string using the formatEther function from ethers.js */}
						{ethSelected
							? `You will get ${utils.formatEther(
								tokenToBeReceivedAfterSwap
							)} Crypto Dev Tokens`
							: `You will get ${utils.formatEther(
								tokenToBeReceivedAfterSwap
							)} Eth`}
					</div>
					<button className={styles.button1} onClick={_swapTokens}>
						Swap
					</button>
				</div>
			);
		}
	}

	return (
		<div>
			<Head>
				<title>Crypto Devs</title>
				<meta name="description" content="Whitelist-Dapp" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div className={styles.main}>
				<div>
					<h1 className={styles.title}>Welcome to Crypto Devs Exchange!</h1>
					<div className={styles.description}>
						Exchange Ethereum &#60;&#62; Crypto Dev Tokens
					</div>
					<div>
						<button
							className={styles.button}
							onClick={() => {
								setLiquidityTab(true);
							}}
						>
							Liquidity
						</button>
						<button
							className={styles.button}
							onClick={() => {
								setLiquidityTab(false);
							}}
						>
							Swap
						</button>
					</div>
					{renderButton()}
				</div>
				<div>
					<img className={styles.image} src="/0.svg" />
				</div>
			</div>

			<footer className={styles.footer}>
				Made with &#10084; by Crypto Devs
			</footer>
		</div>
	)
}
