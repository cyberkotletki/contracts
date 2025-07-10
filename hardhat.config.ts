import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { secret_config } from "./secret_config";


const config = {
    default: "Amoy",
    networks: {
        polygon_amoy: {
           url: secret_config.url,
           accounts: secret_config.accounts,
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
