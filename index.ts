import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    const address = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788"; //setup another contract if u want to test it (i'm to lazy to create env file)
    console.log(address);
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); 

    //const abi = await ( await fetch('artifacts/contracts/Donates.sol/Donates.json')).json();
    
    const artifactPath = path.resolve(__dirname, "artifacts/contracts/Donates.sol/Donates.json");
    const artifactRaw = fs.readFileSync(artifactPath, "utf8");
    const abi = JSON.parse(artifactRaw).abi;



    const contract = new ethers.Contract(address, abi, provider);
    contract.on("UserCreated", (uuid, name, event) =>{
        console.log(`name: ${name} uuid: ${uuid}`);
    })

}



main().catch(console.error);

