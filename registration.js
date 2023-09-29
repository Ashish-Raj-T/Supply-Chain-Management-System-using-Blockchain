function RegisterClient(){
    this.clientId = [];
    this.deposit = 0;
    this.productId = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    this.productBought = [];
    this.minDeposit = 100;
}

function RegisterDistributor(){
    this.distributorId = [];
    this.deposit = 0;
    this.productId = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    this.productDestributed = [];
    this.minDeposit = 200;
}

RegisterClient.prototype.addClient = function(_id, _deposit, _product){
    if(_deposit < this.minDeposit){
        return "Please deposit more then minimum Deposit Amount (100)";
    }
    for(let j=0; j<this.clientId.length; j++){
        if(_id == this.clientId[j]){
            return "You are already Registered";
        }
    }
    for(let i=0; i<this.productId.length; i++){
        
        if(_product == this.productId[i]){
            const newClient = {
                id : _id,
                product : _product
            }
            
            this.clientId.push(newClient.id);
            this.productBought.push(newClient.product);
            
            return "Success! You are Registered as a Client!!";
        }
        else{
            if(i == this.clientId.length - 1){
                return "Product does not exist in the system";
            }
        }
    }
}

RegisterDistributor.prototype.addDistributor = function(_id, _deposit, _product){
    if(_deposit < this.minDeposit){
        return "Please deposit more then minimum Deposit Amount (200)";
    }
    for(let j=0; j<this.distributorId.length; j++){
        if(_id == this.distributorId[j]){
            return "You are already Registered";
        }
    }
    for(let i=0; i<this.productId.length; i++){
        if(_product == this.productId[i]){
            const newDistributor = {
                id : _id,
                product : _product
            }

            this.distributorId.push(newDistributor.id);
            this.productDestributed.push(newDistributor.product);
            
            return "Success! You are Registered as a Distributor!!";
        }
        else{
            if(i == this.clientId.length - 1){
                return "Product does not exist in the system";
            }
        }
    }
}

module.exports = RegisterClient;
module.exports = RegisterDistributor;
