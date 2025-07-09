import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { build } from "bun";

const DonatesModule = buildModule("DonatesModule", (m) =>{
  const donates = m.contract("Donates",[2]);
  return {donates};
})

export default DonatesModule;