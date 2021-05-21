const BeaverWhisperer = artifacts.require("BeaverWhisperer");

contract("BeaverWhisperer", async accounts => {

    const initialMsg = 'Dam it';
    const creatorAddr = accounts[1];
    let contract;

    beforeEach(async () => {
        contract = await BeaverWhisperer.new(initialMsg, { from: creatorAddr });
    })

    it("should initialize values", async () => {
        const beaverSays = await contract.beaverSays.call();
        expect(beaverSays).to.equal(initialMsg);

        const owner = await contract.owner.call();
        expect(owner).to.equal(creatorAddr);

        const creator = await contract.creator.call();
        expect(creator).to.equal(creatorAddr);

        const lastSaleAmount = (await contract.lastSaleAmount.call()).toString();
        expect(lastSaleAmount).to.equal('0');
    });

    describe('buy', () => {
        it('should change owner', async () => {
            const buyer = accounts[3];

            await contract.buy({ from: buyer, value: 10 });

            const owner = await contract.owner.call();
            expect(owner).to.equal(buyer);
        })
        it('should fail if caller pays less or the same amount as previous owner', async () => {
            const firstBuyer = accounts[3];
            const failedBuyer = accounts[2];

            await contract.buy({ from: firstBuyer, value: 10 });


            try {
                await contract.buy({ from: failedBuyer, value: 10 });
                expect.fail();
            } catch (e) {
                expect(e.reason).to.equal('You are cheap! Pay more!');
            }

            try {
                await contract.buy({ from: failedBuyer, value: 5 });
                expect.fail();
            } catch (e) {
                expect(e.reason).to.equal('You are cheap! Pay more!');
            }


            const owner = await contract.owner.call();
            expect(owner).to.equal(firstBuyer);
        })
    })

    describe('setBeaverSays', () => {
        it('fail for non owner', async () => {
            const buyer = accounts[3];

            await contract.buy({ from: buyer, value: 10 });

            try {
                await contract.setBeaverSays('vof vof', { from: accounts[5] });
                expect.fail();
            } catch (e) {
                expect(e.reason).to.equal('You are NOT my owner!');
            }
        })
        it('owner should be able to change text', async () => {
            const beaverSaysBeforeUpdate = await contract.beaverSays.call();
            expect(beaverSaysBeforeUpdate).to.equal(initialMsg);


            const buyer = accounts[3];
            await contract.buy({ from: buyer, value: 10 });


            const newMessage = 'vof vof';
            await contract.setBeaverSays(newMessage, { from: buyer });

            const beaverSaysAfterUpdate = await contract.beaverSays.call();
            expect(beaverSaysAfterUpdate).to.equal(newMessage);
        })
    })
    describe('claim', () => {
        it('should fail for not creator', async () => {
            try {
                await contract.claim({ from: accounts[2] });
                expect.fail();
            } catch (e) {
                expect(e.reason).to.equal('You are not the creator!');
            }
        })
        it('should pay money to the creator', async () => {
            const creatorBalanceBeforeClaim = await web3.eth.getBalance(creatorAddr);

            const weiValue = web3.utils.toWei('1', 'ether');

            await contract.buy({ from: accounts[0], value: weiValue });

            await contract.claim({ from: creatorAddr });


            const creatorBalanceAfterClaim = await web3.eth.getBalance(creatorAddr)
            const contractBalance = await web3.eth.getBalance(contract.address)

            expect(contractBalance.toString()).to.equal('0');
            expect(Number(creatorBalanceBeforeClaim.toString())).to.be.below(Number(creatorBalanceAfterClaim.toString()))
        })
    })
    describe('finalize', () => {
        it('should fail for not creator', async () => {
            try {
                await contract.finalize({ from: accounts[2] });
                expect.fail();
            } catch (e) {
                expect(e.reason).to.equal('You are not the creator!');
            }
        })
        it('should pay money to the creator', async () => {
            const creatorBalanceBeforeClaim = await web3.eth.getBalance(creatorAddr);

            const weiValue = web3.utils.toWei('1', 'ether');

            await contract.buy({ from: accounts[0], value: weiValue });

            await contract.finalize({ from: creatorAddr });


            const creatorBalanceAfterClaim = await web3.eth.getBalance(creatorAddr)
            const contractBalance = await web3.eth.getBalance(contract.address)

            expect(contractBalance.toString()).to.equal('0');
            expect(Number(creatorBalanceBeforeClaim.toString())).to.be.below(Number(creatorBalanceAfterClaim.toString()))
        })
    })
});
