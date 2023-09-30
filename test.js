const Blockchain = require('./blockchain');
const transaction = require('./transactions'); 
const {RegisterClient,RegisterDistributor} = require('./registration');
const SHA = require("crypto-js/sha256");
const prompt = require('prompt-sync')();

const exchange = new transaction();
const blockchain = new Blockchain();
const registerClients = new RegisterClient();
const registerDistributors = new  RegisterDistributor();
const firstHash = blockchain.blockchain[0].prevBlockHash;

console.log('Genesis :',firstHash);

function option(){
    const message = 'Select any one of the following:';
    const options = [
    'Click 0: Add transactions',
    'Click 1: See transactions added',
    'Click 2: Start mining block',
    'Click 3: Register New client',
    'Click 4: Register New Distributor',
    'Click 5: Buy Product as a client',
    'Click 6: Buy Product as a distributor',
    'Click 7: Exit'
    ];

    console.log(message);
    options.forEach(option => console.log(option));
    const userInput = prompt('Enter your choice (0-7): ');
    let choice = parseInt(userInput);
    
    if (!isNaN(choice) && choice >= 0 && choice < options.length) {
        console.log(`You selected: ${options[choice]}`);
    } 
    else {
        console.log('Invalid choice. Please select a valid option.')
        choice = 7;
    }
    return choice;
}

var whatNext = option();

while(whatNext != 7){
    // To see Transaction history of a product
    if(whatNext == 0){
        var product = prompt("Select a product you wish to purchase: ");
        var clientId = prompt("Enter your client Id");
        // for(let i=0;i<exchange.distibutorsRegistered.length;i++){
        //     if(exchange.ManuToDist(exchange.distibutorsRegistered[i],product,clientId))
        // }
    }
    else if(whatNext == 1){
        // var transId = prompt("Product ID: ");
        // for(let i=0; i<blockchain.newTransaction.length; i++){
        //     if(transId == blockchain.newTransaction[i].id){
        //         console.log(bitcoin.newTransaction[i]);
        //         break;
        //     }
        // }
        // let owned = 0;
        // for(let j=0; j<exchange.allTransactions.length; j++){
        //     if(transId == exchange.allTransactions[2*j + 1]){
        //         if(owned == 0){
        //             console.log("Owner : " +  exchange.allTransactions[2*j] + " Property Id : " + exchange.allTransactions[2*j+1]);
        //             owned = 1;
        //         }
        //         else {
        //             console.log("seller : " +  exchange.allTransactions[2*j] + " Property Id : " + exchange.allTransactions[2*j+1]);
        //             owned = 0;
        //         }
        //     }
        // }
    }
    else if(whatNext == 2){
        
    }
    else if(whatNext == 3){
        console.log(registerClients.clients);
        var clientId = prompt('Enter a unique client Id : ');
        var deposit = prompt('Enter the depoist amount you wish to add (at least 100) : ')
        let message = registerClients.addClient(clientId,deposit);
        console.log(message); 
    }
    else if(whatNext == 4){
        var distributorId = prompt('Enter a unique Distributor Id : ');
        var deposit = prompt('Enter the deposit amount you wish to add (at least 100) : ')
        let message = registerDistributors.addDistributor(distributorId,deposit);
        console.log(message); 
    }
    else if(whatNext == 5){
        var clientId = prompt('Enter your client Id : ');
        var product = prompt('Select the product you wish to buy (1-20) : ');
        var amount_added = prompt('Enter the amount you wish to add to your balance : ');
        let message = "";
        
        for(let i=0;i<registerClients.clients.length;i++){
            if(registerClients.clients[i].clientId==clientId){
                registerClients.clients[i].deposit += amount_added;
                break;
            }
            else if(i == registerClients.clients.length - 1){
                message = 'Client Not Found';
            }
        }

        for(let i=0;i<registerDistributors.distributors.length&&!message.length;i++){
            for(let j=0;j<registerDistributors.distributors[i].products.length&&!message.length;j++){
                if(registerDistributors.distributors[i].products[j]==product){
                    for(let k=0;k<registerClients.clients.length&&!message.length;k++){
                        if(registerClients.clients[k]==clientId){
                            if(parseFloat(registerClients.clients.deposit) - parseFloat(exchange.prices[product-1]) < parseFloat(registerClients.minDeposit)){
                                message=`Couldnt purchase the product ${product} as your minimum balance after purchase will be less than ${registerClients.minDeposit}`;
                            }
                            else{
                                registerClients.clients.deposit -= exchange.prices[product-1];
                                registerDistributors.distributors[i].products.slice(j,1);
                                registerDistributors.distributors[i].deposit += exchange.prices[product-1];
                                const new_D_to_C_transaction={
                                    buyer:clientId,
                                    product:product,
                                    price:exchange.prices[product-1],
                                    seller:registerDistributors.distributors[i].distributorId,
                                    type:0,
                                }
                                exchange.allTransactions.push(new_D_to_C_transaction);
                                message="Success!! Product bought";
                            }
                            break;
                        }
                    }
                }
            }
        }
        console.log(message)
    }
    else if(whatNext == 6){
        var distId = prompt("Enter your distributor Id : ");
        var product = prompt('Select the product you wish to buy (1-20) : ');
        var amount_added = prompt('Enter the amount you wish to add to your balance : ');
        for(let i=0;i<registerDistributors.distributors.length;i++){
            if(registerDistributors.distributors[i].distributorId==distId){
                registerDistributors.distributors[i].deposit = parseFloat(registerDistributors.distributors[i].deposit) + parseFloat(amount_added);
                if(parseFloat(registerDistributors.distributors[i].deposit) - parseFloat(exchange.prices[product-1]) < parseFloat(registerDistributors.minDeposit)){
                    message=`Couldnt purchase the product ${product} as your minimum balance after purchase will be less than ${registerClients.minDeposit}`;
                }
                else{
                    registerDistributors.distributors[i].deposit = parseFloat(registerDistributors.distributors[i].deposit) - parseFloat(exchange.prices[product-1]);
                    registerDistributors.distributors[i].products.push(product);
                    const new_M_to_D_transaction={
                        buyer:distId,
                        product:product,
                        price:exchange.prices[product-1],
                        seller:"Manufacturer",
                        type:1,
                    }
                    exchange.allTransactions.push(new_M_to_D_transaction);
                    message="Success!! Product bought";
                }
                console.log(registerDistributors.distributors[i]);
            }
            else if(i == registerDistributors.distributors.length - 1){
                message = 'Client Not Found';
            }
        }
        
    }
    else if(whatNext == 7){
        break;
    }
    whatNext = option();
}
