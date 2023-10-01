const SHA = require("sha256");

function RegisterClient(){
    this.clients = [];
    this.minDeposit = 100;
}

function RegisterDistributor(){
    this.distributors = [];
    this.minDeposit = 200;
}

RegisterClient.prototype.addClient = function(id,deposit){
    if(deposit<this.minDeposit){
        return "The minimum deposit Amount is 100";
    }
    if(id.length==0){
        return "Id must contain at least one character";
    }
    if(id.length>20){
        return "Distributor Id must be at most 20 characters long";
    }
    for(let i=0;i<this.clients.length;i++){
        if(id==this.clients[i].clientId){
            return "The Client Id is already in use";
        }
    }
    const client = {
        clientId : id, // unique client id
        deposit : parseFloat(deposit), // money the client has currently deposited
        purchases : [], // purchase info
        privateKey : SHA(id + Date.now()), // signature
        timestamp : Date.now(),
    }
    this.clients.push(client);
    return "Success!! You have been registered";
}

RegisterDistributor.prototype.addDistributor = function(id,deposit){
    if(deposit<this.minDeposit){
        return "The minimum deposit Amount is 200";
    }
    if(id.length==0){
        return "Id must contain at least one character";
    }
    if(id.length>20){
        return "Distributor Id must be at most 20 characters long";
    }
    for(let i=0;i<this.distributors.length;i++){
        if(id==this.distributors[i]){
            return "The Distributor Id is already in use";
        }
    }
    const distributor = {
        distributorId : id, // a unique distibutor id
        deposit: parseFloat(deposit), // money the distributor has currently deposited
        products: new Map(), // List of products he has
        status:0, // 0 free, 1 dispatching
        privateKey : SHA(id + Date.now()), // signature
        timestamp : Date.now(), 
    }
    this.distributors.push(distributor);
    return "Success!! You have been registered";
}

module.exports ={ RegisterClient,RegisterDistributor};
