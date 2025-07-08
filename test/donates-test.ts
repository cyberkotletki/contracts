import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import {expect} from "chai";

describe('donates', () =>{
    const DEFAULT_COMMISSION: number = 2;

    async function setupAndDeploy(a: number = DEFAULT_COMMISSION) {
        const [owner, otherAccount] = await hre.ethers.getSigners();
        const Donates = await hre.ethers.getContractFactory("Donates");
        const donates = await Donates.deploy(a);

        return {donates, owner, otherAccount}
    }

    describe('deploy and constructor', () =>{
        it('should be the right owner', async () =>{
            const {owner, donates} = await loadFixture(setupAndDeploy);
            expect(await donates.owner()).to.equal(owner);
        })

        it('should setup the right commission', async () =>{
            const {donates} = await setupAndDeploy();
            expect(await donates.K()).to.equal(DEFAULT_COMMISSION*10);
        })

        // it('should throw exception on K > 10', async () =>{
        //     const {donates} = await setupAndDeploy(11);
        //     expect(await donates.fallback).to.be.reverted;
        // })
    })

    describe('adding and removing wishes', () =>{
        it('should add wishes', async () =>{
            const {donates, owner} = await setupAndDeploy(2);
            
            await donates.RegisterUser('name', 'uuid', ['topic1', 'topic2']);
            let newUser = await donates.users(owner.address);
            console.log(newUser);

            await donates.AddWish({
                userUUID: newUser.user.uuid,
                id: 1,
                currentBalance: 0,
                price: 100,
                name: 'name',
                link: 'https://uwu',
                description: 'description',
                completed: false,
            })
            newUser = await donates.users(owner);
            console.log("AFTER ADDING WISH: ", newUser.user.wishes);


            await donates.CompleteOrRemoveWish(owner.address, 1, true);
            newUser = await donates.users(owner);
            console.log("AFTER REMOVING WISH: ", newUser.user.wishes);

            
        })

    
    })
    
})