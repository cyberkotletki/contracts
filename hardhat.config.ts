import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config = {
    default: "Amoy",
    networks: {
        polygon_amoy: {
            url: 'PRIVATE_KEY',
            accounts: ['ACCOUNT_PRIVATE_KEY'],
            chainId: 80002,
        }
        
    },
    solidity: {
        version: "0.8.28",
        settings: {
            viaIR: true,
            optimizer: {
                enabled: true,
                runs: 1000,
            },
            evmVersion: "cancun",
        },
    },
};

export default config;
