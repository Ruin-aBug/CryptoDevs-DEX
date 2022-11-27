// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    IERC20 public cryptoDevToken;

    constructor(address _cryptoDevToken) ERC20("CryptoDev LP Token", "CDLP") {
        require(_cryptoDevToken != address(0), "address is zero");
        cryptoDevToken = IERC20(_cryptoDevToken);
    }

    function getReserve() public view returns (uint256) {
        return cryptoDevToken.balanceOf(address(this));
    }

    function addLiquidit(uint256 _amount) external payable returns (uint256) {
        uint256 liquidit;
        uint256 ethBalance = address(this).balance;
        uint256 tokenReserver = getReserve();
        if (tokenReserver == 0) {
            cryptoDevToken.transferFrom(msg.sender, address(this), _amount);
            liquidit = ethBalance;
            _mint(msg.sender, liquidit);
        } else {
            uint256 ethReserve = ethBalance - msg.value;
            uint256 tokenAmount = (msg.value * tokenReserver) / (ethReserve);
            require(
                _amount > tokenAmount,
                "Amount of tokens sent is less than the minimum tokens required"
            );
            cryptoDevToken.transferFrom(msg.sender, address(this), tokenAmount);
            liquidit = (totalSupply() * msg.value) / ethReserve;
            _mint(msg.sender, liquidit);
        }
        return liquidit;
    }

    function removeLiquidity(
        uint256 _amount
    ) external returns (uint256, uint256) {
        require(_amount > 0, "_amount is zero");
        uint256 ethReserve = address(this).balance;
        uint256 _totalSupply = totalSupply();

        uint256 ethAmount = (ethReserve * _amount) / _totalSupply;
        uint256 tokenAmount = (getReserve() * _amount) / _totalSupply;

        _burn(msg.sender, _amount);
        payable(msg.sender).transfer(ethAmount);
        cryptoDevToken.transfer(msg.sender, tokenAmount);
        return (ethAmount, tokenAmount);
    }

    function getAmountOfTokens(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns (uint256) {
        require(inputReserve > 0 && outputReserve > 0, "invalid reserves");
        uint256 inputAmountWithFee = inputAmount * 99;
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 100) + inputAmountWithFee;
        return numerator / denominator;
    }

    function ethToCryptoDevToken(uint256 _mintTokens) external payable {
        uint256 tokenReserve = getReserve();
        uint256 tokenAmount = getAmountOfTokens(
            msg.value,
            address(this).balance,
            tokenReserve
        );
        require(tokenAmount >= _mintTokens, "insufficient output amount");
        cryptoDevToken.transfer(msg.sender, tokenAmount);
    }

    function cryptoDevTokenToEth(uint256 _tokenSold, uint256 _mintEth) public {
        uint256 tokenReserve = getReserve();
        uint256 ethAmount = getAmountOfTokens(
            _tokenSold,
            tokenReserve,
            address(this).balance
        );
        require(ethAmount >= _mintEth, "insufficient output amount");
        cryptoDevToken.transferFrom(msg.sender, address(this), _tokenSold);
        payable(msg.sender).transfer(ethAmount);
    }
}
