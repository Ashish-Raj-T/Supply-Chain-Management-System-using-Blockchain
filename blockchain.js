import sha256 from 'sha256'; // used to create secure hashes for each block
const transaction = require('./transaction');
const buyDistributeSelltrans = new transaction();

class Blockchain {
    constructor() {
        this.chain = [];
        this.validators = [];
        this.newTransaction = [];

        this.addBlock(0, '0', 0);
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(data, stake) {
        
        const newBlock = {
            data: data,
            previousHash: getLatestBlock().hash,
            stake: stake,
            hash: sha256(data + previousHash + stake).toString()
        }

        this.chain.push(newBlock);
    }

    createNewTrans(id, sender, receiver){
        const newTransactions = {
            id: id, // product ID
            sender: sender, // sender ID
            receiver: receiver, // buyer ID
            timestamp: Date.now(),
        };
        this.newTransaction.push(newTransactions);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }

    addValidator(validator, stake) {
        this.validators.push({
            address: validator,
            stake: stake
        });
    }

    selectValidators() {
        this.validators.sort((a, b) => (a.stake > b.stake) ? -1 : 1);
        return this.validators.slice(0, Math.floor(this.validators.length / 3));
    }

    validateBlock(block) {
        const selectedValidators = this.selectValidators();
        let validationCount = 0;

        for (let i = 0; i < selectedValidators.length; i++) {
            if (selectedValidators[i].address === block.validator) {
                validationCount++;
            }
        }

        return validationCount >= Math.floor(selectedValidators.length / 3);
    }
}

module.exports = Blockchain;