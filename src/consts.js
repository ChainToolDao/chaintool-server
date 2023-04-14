const NETWORKS = {
    1: 'mainnet',
    56: 'bnb',
    31337: 'dev'
};

const PROVIDERS = {
    1: `${process.env.MAINNET_PROVIDER_URL}`,
    56: 'https://bsc-dataseed1.defibit.io/',
    31337: 'http://127.0.0.1:8545',
};

const ETHERSCAN_URI = {
    1: 'https://etherscan.io',
    56: 'https://bscscan.com',
}

const ABI_FRAGMENT_TYPE = {
    'constructor': 0,
    'function': 1,
    'event': 2,
    'error': 3,
}

const CHAIN_ID_TO_NETWORK = {
    1: 'Ethereum Mainnet',
    5: 'Goerli',
    11155111: 'Sepolia',
    137: 'Polygon Mainnet',
    80001: 'Mumbai',
    56: 'BNB Chain',
    97: 'BNB Testnet Chain',
    31337: 'Hardhat(localhost)',
}

const CHAIN_IDS = Object.keys(CHAIN_ID_TO_NETWORK);


module.exports = {
    NETWORKS,
    PROVIDERS,
    ETHERSCAN_URI,
    ABI_FRAGMENT_TYPE,
    CHAIN_IDS,
    CHAIN_ID_TO_NETWORK,
};