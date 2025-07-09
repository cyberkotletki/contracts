import hre from 'hardhat';
import DonatesModule from '../ignition/modules/Donates';

async function main() {
    const {donates} = await hre.ignition.deploy(DonatesModule);

    console.log(`contract deployed to: ${await donates.getAddress()}`);
}