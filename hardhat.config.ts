import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config = {
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
