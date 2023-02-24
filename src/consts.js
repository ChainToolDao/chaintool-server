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

module.exports = {
    NETWORKS,
    PROVIDERS,
    ETHERSCAN_URI,
    ABI_FRAGMENT_TYPE,
};