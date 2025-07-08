// import hre from "hardhat";
// import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers";
// import { expect } from "chai";

// describe("Contract",  () => {
//     async function setupAndDeploy() {
//         const [owner, otherAccount] = await hre.ethers.getSigners();
//         const Contract = await hre.ethers.getContractFactory("Contract");
//         const contract = await Contract.deploy();

//         return {contract, owner, otherAccount}
//     }

//     describe("Deployment", () =>{
//         it("Should have the right owner", async () =>{
//             const {contract, owner} = await loadFixture(setupAndDeploy);
//             expect(await contract.owner()).to.equal(owner);
//         })

//         it("Should increments the value", async () =>{
//             const {contract} = await loadFixture(setupAndDeploy);
//             const initial = await contract.count();
//             await contract.inc();
//             expect(await contract.count()).to.equal(initial + BigInt(1));
//         })

//         it("Should revert when trying to decrement below 0", async () => {
//             const { contract } = await loadFixture(setupAndDeploy);
//             await expect(contract.decr()).to.be.revertedWith("count must be > 0");
//         });

//         it ("should decrement from 1 to 0", async () =>{
//             const {contract} = await loadFixture(setupAndDeploy);
//             const initial = await contract.count();
//             await contract.inc();
//             await contract.decr();
//             expect(await contract.count()).to.equal(initial);
//         })
//     })
// })