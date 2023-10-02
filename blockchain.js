const SHA = require("crypto-js/sha256");
// const transaction = require('./transaction');
const prompt = require('prompt-sync')();
// const exchange = new transaction();
 
class Blockchain {
    constructor(){
        this.blockchain = [];
        this.validators = [];
        this.genesisBlock();
    }
 
    genesisBlock(){
        const block = {
            data:'0',
            prevBlockHash : 0,
            hash:SHA(0 + '0').toString(),
            timestamp : Date.now(),
        };
        this.blockchain.push(block);
    }
 
    getLastBlock() {
        return this.blockchain[this.blockchain.length - 1];
    }
 
    addBlock(data){
        const block = {
            data:data,
            prevBlockHash : this.getLastBlock()?.hash,
            hash:SHA(data[0] + data[1] + this.getLastBlock()?.hash).toString(),
            timestamp : Date.now(),
        };
        this.blockchain.push(block);
    }
 
    calculateHash(block){
        try {
            const blockString = (block.data[0] + block.data[1] +block.prevBlockHash);
            if (!blockString) {
                throw new Error('Failed to stringify block for hash calculation.');
            }
            return SHA(blockString).toString();
        } catch (error) {
            console.error('Error calculating hash:', error.message);
            return null;  
        }
    }

    printBLockchain(){
        for(let i=0;i<this.blockchain.length;i++){
            console.log(this.blockchain[i]);
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
 
    startVote(){
        for(let i=0;i<this.validators.length;i++){
            this.validators[i].voted=false;
            this.validators[i].votes=parseInt(0);
        }
    }
 
    addValidator(id,type,voted,votes) {
        this.validators.push({
            id : id,
            type : type,
            voted: voted,
            votes : votes,
        });
    }
 
    voteValidator(){
        var id = prompt("Enter your Id: ");
        var type = prompt("Enter 0 if you are a (client) or 1 if (Distributor): ");
        let idx=0;
        for(let i=0;i<this.validators.length;i++){
            if(this.validators[i].id == id && this.validators[i].type==type){
                if(this.validators.voted==true){
                    return "You Have already Voted";
                }
                idx=i;
                break;
            }
            else if(i==this.validators.length-1){
                return "Enter a valid Id."; 
            }
        }
        for(let v=0;v<this.validators.length;v++){
            console.log(v + " to vote for " + this.validators[v].id +" with "+this.validators[v].votes +" votes.")
        }
        var vote = prompt("Choose your vote. You can only vote once per session: ");
        this.validators[idx].voted=true;
        this.validators[vote].votes = parseInt(this.validators[vote].votes)+1;
        console.log(this.validators);
        return "You Vote has been placed successfully";
    }
 
    selectValidators() {
        this.validators.sort((a, b) => (a.votes > b.votes) ? -1 : 1);
        if(this.validators.length<=2){
            return this.validators;
        }
        return this.validators.slice(0, Math.floor(this.validators.length / 3));
    }
 
    validateBlock() {
        const validators = this.selectValidators();
        console.log(`The top validators currently are: \n`);
        let validationCount = 0;
        for (let i = 0; i < validators.length; i++) {
            if(validators[i].type==0){
                console.log(`Client with client Id as ${validators[i].id}`);
            }
            else{
                console.log(`Distributor with distributor Id as ${validators[i].id}`);
            }
            if(this.isChainValid()){
                validationCount++;
            }
        }
        console.log(`Result after voting: ${validationCount} by ${validators.length} validated the transactions`);
        return validationCount >= Math.floor(validators.length*2/3);
    }
}

 

 
module.exports = Blockchain;