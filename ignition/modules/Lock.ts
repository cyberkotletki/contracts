import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Donates", (m) => {
  const donations = m.contract("Donates", [4]);
  // m.call(donations, "launch", []);
  return {donations};
})