function buyDistributeSell(){
    this.availableProd = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    this.transHistory = [];
    this.type = 0; 
    // type = 0 => Distributor buying from Manufacturer
    // type = 1 => Client buying from Distributor
    this.clientsRegistered = [];
    this.distributorRegistered = [];
}

// A Map between products and users
const distributorData = new Map();

buyDistributeSell.prototype.buy = function(distributorId, productId, depositAmount){

    if(depositAmount < 200){
        return "Deposit amount should be more than Minimum Deposit Amount (200)";
    }
    for(let i=0; i<this.availableProd.length; i++){
        if(productId == this.availableProd[i]){
            distributorData.set(productId, distributorId);
            this.transHistory.push(distributorId);
            this.transHistory.push(productId);
            return "Success!!";
        }
        else{
            if(i == this.availableProd.length - 1){
                return "Product does not exist";
            }
        }
    }
}

buyDistributeSell.prototype.sell = function(clientId, productId){
    if(distributorData.get(productId) != undefined){
        let distId = distributorData[productId];
        distributorData.set(productId, undefined);
        // => successfull transaction
        this.transHistory.push(clientId);
        this.transHistory.push(distId);
        return "Success!!!";
    }
    else{
        return "There is no Distributor selling this Product";
    }
}

module.exports = buyDistributeSell;
