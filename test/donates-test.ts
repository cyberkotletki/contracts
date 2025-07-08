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

    })

    describe('adding and removing wishes', () =>{
        it('should add and remove wishes', async () =>{
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
        
            await donates.CompleteOrRemoveWish(owner.address, 1, true);
            newUser = await donates.users(owner);
            expect(newUser.user.wishes.length).to.equal(0);
        })
    })

    describe("verify donation works", () =>{
        it("should get the right commission", async () =>{
            const {donates, owner, otherAccount} = await setupAndDeploy(2);
            
            await donates.connect(owner).RegisterUser('owner', '0', ['owo', 'uwu']);
            
            await donates.connect(otherAccount).RegisterUser('idk', '1', ['-w-']);
            const otherAccountAddress = otherAccount.address;

            await donates.connect(otherAccount).AddWish({
                userUUID: '1',
                id: 0,
                currentBalance: 0,
                price: 10000000000,
                name: 'book',
                link: 'https://boook',
                description: 'it is a book',
                completed: false
            });

            const donateAmount = hre.ethers.parseEther('0.00001');
            await donates.connect(owner).Donate('010', {
                userName: 'owner',
                messageText: 'hello!',
            }, {
                date: 1234,
                fromUUID: '0',
                toUUID: '1',
                wishId: 0,
                toAddress: otherAccountAddress,
                paymentType: 0,
            }, {
                value: donateAmount,
            })

            expect(await donates.ownerBalance()).to.equal(donateAmount*BigInt(2)/BigInt(100));
        })

    
    })
})