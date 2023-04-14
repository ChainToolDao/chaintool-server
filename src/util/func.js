const ethers = require('ethers');
const consts = require('../consts');


function isValidAddress(address) {
    // eg: 0x221507c5cae31196a535f223c022eb0e38c3377d
    if (!address) return false;
    return ethers.utils.isAddress(address.toLowerCase());
}

function isValidAbi(jsonStr) {
    // eg: ["constructor()","event Approval(address indexed owner, address indexed spender, uint256 value)","event Transfer(address indexed from, address indexed to, uint256 value)","function allowance(address owner, address spender) view returns (uint256)","function approve(address spender, uint256 amount) returns (bool)","function balanceOf(address account) view returns (uint256)","function decimals() view returns (uint8)","function decreaseAllowance(address spender, uint256 subtractedValue) returns (bool)","function increaseAllowance(address spender, uint256 addedValue) returns (bool)","function name() view returns (string)","function symbol() view returns (string)","function totalSupply() view returns (uint256)","function transfer(address to, uint256 amount) returns (bool)","function transferFrom(address from, address to, uint256 amount) returns (bool)"]
    let abi = null;

    try {
        abi = JSON.parse(jsonStr);
    } catch (err) {
        console.warn('====notValidAbi====', jsonStr);
    }

    return Array.isArray(abi);
}

function isValidChainId(chainId) {
    return consts.CHAIN_IDS.includes(String(chainId));
}

function getChecksumAddress(address) {
    if (!isValidAddress(address)) return null;
    return ethers.utils.getAddress(address);
}

function formatAbi(jsonStr) {
    if (!isValidAbi(jsonStr)) return null;
    return JSON.stringify(JSON.parse(jsonStr));
}


module.exports = {
    isValidAddress,
    isValidAbi,
    isValidChainId,
    getChecksumAddress,
    formatAbi,
}