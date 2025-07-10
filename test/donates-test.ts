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

        it('should throw exception with comission > 10', async () =>{
            // const {donates} = await setupAndDeploy(11);
            expect(await setupAndDeploy()).to.be.revertedWith("K can't be equal to 0 or more than 10");
        })

    })

    describe('adding and removing wishes', () =>{
        it('should add and remove wishes', async () =>{
            const {donates, owner} = await setupAndDeploy(2);
            await donates.registerUser('name', 'uuid', ['topic1', 'topic2']);
            let newUser = await donates.users(owner.address);

            await donates.addWish({
                userUUID: newUser.user.uuid,
                uuid: '1',
                currentBalance: 0,
                price: 100,
                name: 'name',
                link: 'https://uwu',
                description: 'description',
                completed: false,
            })
        
            await donates.completeOrRemoveWish(owner.address, '1', true);
            newUser = await donates.users(owner);
            expect(newUser.user.wishes.length).to.equal(0);
        });

        it('should throw exception with price == 0', async () =>{
            const {donates, owner} = await setupAndDeploy();
            
            await donates.registerUser('name', 'uuid', ['topic1', 'topic2']);
            expect(donates.addWish({
                userUUID: '0',
                uuid: '1',
                currentBalance: 0,
                price: 0,
                name: 'name',
                link: 'https://uwu',
                description: 'description',
                completed: false,
            })).to.be.revertedWith('cost must be more than zero');
        });

        it('should throw exception with completed == true', async () =>{
            const {donates, owner} = await setupAndDeploy();
            
            await donates.registerUser('name', 'uuid', ['topic1', 'topic2']);
            expect(donates.addWish({
                userUUID: '0',
                uuid: '1',
                currentBalance: 0,
                price: 0,
                name: 'name',
                link: 'https://uwu',
                description: 'description',
                completed: true,
            })).to.be.revertedWith('cost must be more than zero');

        
        })
        
        it('should throw exception bcs already completed', async () =>{
            const {donates, owner} = await setupAndDeploy();
            
            await donates.registerUser('name', 'uuid', ['topic1', 'topic2']);
            await donates.addWish({
                userUUID: '0',
                uuid: '1',
                currentBalance: 0,
                price: 999,
                name: 'name',
                link: 'https://uwu',
                description: 'description',
                completed: false,
            });

            expect(donates.completeOrRemoveWish(owner.address, '1', false)).
            to.be.revertedWith('already completed');
        })

        it('should throw exception bcs ID1 == ID2', async () =>{
              const {donates, owner} = await setupAndDeploy();
            
            await donates.registerUser('name', 'uuid', ['topic1', 'topic2']);
            await donates.addWish({
                userUUID: '0',
                uuid: '1',
                currentBalance: 0,
                price: 567,
                name: 'name',
                link: 'https://uwu',
                description: 'description',
                completed: false,
            });

            expect(donates.addWish({
                userUUID: '0',
                uuid: '1',
                currentBalance: 0,
                price: 9809,
                name: 'name',
                link: 'https://uwu',
                description: 'description',
                completed: false,
            })).to.be.revertedWithCustomError(donates, 'Alreadyexists');
        });

    })

    describe("verify donation and withdraw works", () =>{
        it("should get the right commission", async () =>{
            const {donates, owner, otherAccount} = await setupAndDeploy(2);
            await donates.connect(owner).registerUser('owner', '0', ['owo', 'uwu']);
            await donates.connect(otherAccount).registerUser('idk', '1', ['-w-']);
            const otherAccountAddress = otherAccount.address;

            await donates.connect(otherAccount).addWish({
                userUUID: '1',
                uuid: '4',
                currentBalance: 0,
                price: 10000000000,
                name: 'book',
                link: 'https://boook',
                description: 'it is a book',
                completed: false
            });

            const donateAmount = hre.ethers.parseEther('0.00001');
            await donates.connect(owner).donate('010', {
                userName: 'owner',
                messageText: 'hello!',
            }, {
                date: 1234,
                fromUUID: '0',
                toUUID: '1',
                wishUUID: '4',
                toAddress: otherAccountAddress,
                paymentType: 0,
            }, {
                value: donateAmount,
            })

            expect(await donates.ownerBalance()).to.equal(donateAmount*BigInt(2)/BigInt(100));
        })

        it('should withdraw succesfully', async () =>{
            const {donates, owner, otherAccount} = await setupAndDeploy(2);
            await donates.connect(owner).registerUser('owner', '0', ['owo', 'uwu']);
            await donates.connect(otherAccount).registerUser('idk', '1', ['-w-']);
            const otherAccountAddress = otherAccount.address;

            await donates.connect(otherAccount).addWish({
                userUUID: '1',
                uuid: '0',
                currentBalance: 0,
                price: 10000000000,
                name: 'book',
                link: 'https://boook',
                description: 'it is a book',
                completed: false
            });

            const donateAmount = hre.ethers.parseEther('0.00001');
            await donates.connect(owner).donate('010', {
                userName: 'owner',
                messageText: 'hello!',
            }, {
                date: 1234,
                fromUUID: '0',
                toUUID: '1',
                wishUUID: '0',
                toAddress: otherAccountAddress,
                paymentType: 0,
            }, {
                value: donateAmount,
            })



            const withdrawAmount = donateAmount * BigInt(98)/BigInt(100);            
            const balanceBefore = await hre.ethers.provider.getBalance(otherAccount.address);

            const tx = await donates.connect(otherAccount).withdraw('wqe', '1', withdrawAmount);

            const receipt = await tx.wait();
            if (!receipt){
                fail();
            }
            const gasUsed = receipt.gasUsed * tx.gasPrice;

            const balanceAfter = await hre.ethers.provider.getBalance(otherAccount.address);
            const expectedDelta = withdrawAmount - gasUsed;

            expect(balanceAfter).to.be.closeTo(balanceBefore + expectedDelta, hre.ethers.parseEther('0.0000001'));

        })

        it('should fail bcs not enough balance', async () =>{
            const {donates} = await setupAndDeploy();
            expect(donates.withdraw('', '', 0)).to.be.reverted;
        });
    })

    describe("owner withdraw", () =>{
        it('should transact', async () => {
            const {donates, owner, otherAccount} = await setupAndDeploy(2);
            await donates.connect(owner).registerUser('owner', '0', ['owo', 'uwu']);
            await donates.connect(otherAccount).registerUser('idk', '1', ['-w-']);
            const otherAccountAddress = otherAccount.address;

            await donates.connect(otherAccount).addWish({
                userUUID: '1',
                uuid: '4',
                currentBalance: 0,
                price: 10000000000,
                name: 'book',
                link: 'https://boook',
                description: 'it is a book',
                completed: false
            });

            const donateAmount = hre.ethers.parseEther('0.004');
            await donates.connect(owner).donate('010', {
                userName: 'owner',
                messageText: 'hello!',
            }, {
                date: 1234,
                fromUUID: '0',
                toUUID: '1',
                wishUUID: '0',
                toAddress: otherAccountAddress,
                paymentType: 0,
            }, {
                value: donateAmount,
            })

            const balanceBefore = await hre.ethers.provider.getBalance(owner.address);
        
            const withdrawAmount = await donates.ownerBalance();
            const tx = await donates.ownerWithdaw(withdrawAmount);

            const receipt = await tx.wait();
            if (!receipt){
                fail();
            }
            const gasUsed = receipt.gasUsed * tx.gasPrice;
            const expectedDelta = withdrawAmount - gasUsed;

            const balanceAfter = await hre.ethers.provider.getBalance(owner.address);



            expect(balanceAfter).to.closeTo(balanceAfter + expectedDelta,  hre.ethers.parseEther('0.000001'));
        })
    })

    describe("user logic", () =>{
          const user = {
            user: {
                name: 'owner',
                uuid: 'uuid',
                topics: ['uwынск', 'q'],
                wishes: [],
                payments: [], 
            },
            currentBalance: 0,
        };
      
    
        it('should create right owner', async () =>{
            const {owner, donates} = await setupAndDeploy(2);
            await donates.registerUser('owner', 'uuid' ,['uwынск', 'q']);
        
            expect(((await donates.users(owner.address)).currentBalance)).to.equal(user.currentBalance);
            expect((await donates.users(owner.address)).user.name).to.equal(user.user.name);
            expect((await donates.users(owner.address)).user.uuid).to.equal(user.user.uuid);
            expect((await donates.users(owner.address)).user.topics).to.deep.equal(user.user.topics);
            expect((await donates.users(owner.address)).user.wishes).to.deep.equal(user.user.wishes);
            expect((await donates.users(owner.address)).user.payments).to.deep.equal(user.user.payments);
        })
        
        it('should correctly rename user', async () =>{
            const {owner, donates} = await setupAndDeploy(2);
            await donates.registerUser('owner', 'uuid' ,['uwынск', 'q']);
            await donates.changeName("uwынск");
            expect((await donates.users(owner.address)).user.name).to.equal('uwынск');
        })
    })

    
})