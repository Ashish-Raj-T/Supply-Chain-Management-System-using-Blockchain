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
    for(let i=0;i<this.clients.length;i++){
        if(id==this.clients[i].clientId){
            return "The Client Id is already in use";
        }
    }
    const client = {
        clientId : id,
        deposit: parseFloat(deposit),
    }
    this.clients.push(client);
    return "Success!! You have been registered";
}

RegisterDistributor.prototype.addDistributor = function(id,deposit){
    if(deposit<this.minDeposit){
        return "The minimum deposit Amount is 200";
    }
    for(let i=0;i<this.distributors.length;i++){
        if(id==this.distributors[i]){
            return "The Distributor Id is already in use";
        }
    }
    const distributor = {
        distributorId : id,
        deposit: parseFloat(deposit),
        products:[],
    }
    this.distributors.push(distributor);
    return "Success!! You have been registered";
}

module.exports ={ RegisterClient,RegisterDistributor};

