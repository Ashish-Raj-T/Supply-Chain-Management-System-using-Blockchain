const SHA = require("crypto-js/sha256");
const transaction = require('./transactions');
const exchange = new transaction();

class Blockchain {
    constructor(){
        this.blockchain = [];
        this.validators = [];
        this.newTransaction = [];
        this.genesisBlock();
    }

    genesisBlock(){
        const block = {
            data:'0',
            prevBlockHash : 0,
            stake:0,
            hash:SHA(0 + '0' + 0).toString(),
        };
        this.blockchain.push(block);
    }

    getLastBlock() {
        return this.blockchain[this.blockchain.length - 1];
    }

    addBlock(data,stake){
        const block = {
            data:data,
            prevBlockHash : this.getLastBlock()?.hash,
            stake:stake,
            hash:SHA(data + this.getLastBlock()?.hash + stake).toString(),
        };
        this.blockchain.push(block);
    }

    calculateHash(block){
        try {
            const blockString = (block.data+block.prevBlockHash+block.stake);
            if (!blockString) {
                throw new Error('Failed to stringify block for hash calculation.');
            }
            return SHA(blockString).toString();
        } catch (error) {
            console.error('Error calculating hash:', error.message);
            return null;  
        }
    }

    isChainValid(){
        for(let i=1;i<this.blockchain.length;i++){
            const currBlock = this.blockchain[i];
            const prevBlock = this.blockchain[i-1];
            if(currBlock.hash !== this.calculateHash(currBlock)){
                return false;
            }
            if(currBlock.prevBlockHash !== prevBlock.hash){
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

    addTransaction(productId, senderId, receiverId){
        const transaction = {
            productId: productId, 
            senderId: senderId,
            receiverId: receiverId,
            timestamp: Date.now(),
        };
        this.newTransaction.push(transaction);
    }

    selectValidators() {
        this.validators.sort((a, b) => (a.stake > b.stake) ? -1 : 1);
        return this.validators.slice(0, Math.floor(this.validators.length / 3));
    }

    validateBlock(block) {
        const validators = this.selectValidators();
        let validationCount = 0;

        for (let i = 0; i < validators.length; i++) {
            if (validators[i].address === block.validator) {
                validationCount++;
            }
        }

        return validationCount >= Math.floor(validators.length / 3);
    }

}

const blockchain = new Blockchain();
console.log(blockchain.getLastBlock());
blockchain.addBlock("dsjfnkjdsnfkjsdnfkj",400);
console.log(blockchain.getLastBlock());
console.log(blockchain.isChainValid())

module.exports = Blockchain;