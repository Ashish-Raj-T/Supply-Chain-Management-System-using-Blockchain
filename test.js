const Blockchain = require('./blockchain');
const transaction = require('./transaction');
const {RegisterClient,RegisterDistributor} = require('./registration');
const SHA = require("sha256");
const prompt = require('prompt-sync')();
// var qrcode = require('qrcode-terminal');
const QRCode = require('qrcode-terminal');

const exchange = new transaction();
const blockchain = new Blockchain();
const registerClients = new RegisterClient();
const registerDistributors = new  RegisterDistributor();
const firstHash = blockchain.blockchain[0];

console.log('Genesis :',firstHash);

function displayQRCode(jsonObject) {
    try {
      // Convert the JSON object to a string
      const jsonString = JSON.stringify(jsonObject);
  
      // Generate the QR code
      QRCode.generate(jsonString, { small: true });
  
      // Display a message below the QR code (optional)
      console.log('Scan the QR code above to see the JSON data.');
  
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
}

function option(){
    const message = 'Select any one of the following:';
    const options = [
    'Click 1: See transactions added',
    'Click 2: Start mining block',
    'Click 3: Register New client',
    'Click 4: Register New Distributor',
    'Click 5: Buy Product as a client',
    'Click 6: Buy Product as a distributor',
    'Click 7: Vote',
    'Click 8: Display QR Code',
    'Click 9: Exit'
    ];

    console.log(message);
    options.forEach(option => console.log(option));
    const userInput = prompt('Enter your choice (0-9): ');
    let choice = parseInt(userInput);
    
    if (!isNaN(choice) && choice >= 0 && choice < options.length) {
        console.log(`You selected: ${options[choice-1]}`);
        console.log();
    } 
    else {
        console.log('Invalid choice. Please select a valid option.');
        console.log();
    }
    return choice;
}

var whatNext = option();

while(whatNext != 9){
    // To see Transaction history of a product
    if(whatNext == 1){
        if(exchange.allTransactions.length == 0){
            console.log("No transactions to show.");
        }
        else{
            console.log("All the transactions till now: ");
            for(let i=0; i<exchange.allTransactions.length; i++){
                console.log(exchange.allTransactions[i]);
            }
        }
    }
    else if(whatNext == 2){
        if(blockchain.validateBlock()){
            for(let i=0;i<exchange.allTransactions-1;i+=2){
                const blockData = {
                    transaction1 : exchange.allTransactions[i],
                    transaction2 : exchange.allTransactions[i+1],
                }
                blockchain.addBlock(blockData);
            }
        }
        blockchain.startVote();
    }
    else if(whatNext == 3){
        var clientId = prompt('Enter a unique client Id : ');
        var deposit = prompt('Enter the deposit amount you wish to add (at least 100) : ')
        let message = registerClients.addClient(clientId,deposit);
        console.log("All the Clients registered till now: ");
        console.log(registerClients.clients);
        if(message=="Success!! You have been registered"){
            blockchain.validators.push({
                id : clientId,
                type : 0,
                voted: false,
                votes : parseInt(0),
            });
        }
        console.log(message); 
    }
    else if(whatNext == 4){   
        var distributorId = prompt('Enter a unique Distributor Id : ');
        var deposit = prompt('Enter the deposit amount you wish to add (at least 200) : ')
        let message = registerDistributors.addDistributor(distributorId,deposit);
        console.log("All the Distributors registered till now: ");
        console.log(registerDistributors.distributors);
        if(message=="Success!! You have been registered"){
            blockchain.validators.push({
                id : distributorId,
                type : 1,
                voted: false,
                votes : parseInt(0),
            });
        }
        console.log(message); 
    }
    else if(whatNext == 5){
        var clientId = prompt('Enter your client Id : ');
        for(let i=0;i<registerClients.clients.length;i++){
            if(registerClients.clients[i].clientId==clientId){
                break;
            }
            else if(i == registerClients.clients.length - 1){
                message = 'Client Not Found';
            }
        }
        var product = prompt('Select the product you wish to buy (1-20) : ');
        var amount_added = prompt('Enter the amount you wish to add to your balance : ');
        let message = "";
        for(let i=0;i<registerClients.clients.length;i++){
            if(registerClients.clients[i].clientId==clientId){
                registerClients.clients[i].deposit += amount_added;
                break;
            }
        }
        
        for(let i=0; i<registerDistributors.distributors.length && !message.length; i++){
            for(let j=0; j<registerDistributors.distributors[i].products.length && !message.length; j++){
                if(registerDistributors.distributors[i].products[j]==product){
                    for(let k=0; k<registerClients.clients.length && !message.length; k++){
                        if(registerClients.clients[k].clientId == clientId){
                            if(parseFloat(registerClients.clients[k].deposit) - parseFloat(exchange.prices[product-1]) < parseFloat(registerClients.minDeposit)){
                                message=`Couldnt purchase the product ${product} as your minimum balance after purchase will be less than ${registerClients.minDeposit}`;
                            }
                            else{
                                registerClients.clients[k].deposit -= exchange.prices[product-1];
                                const newProduct = registerDistributors.distributors[i].products.filter((element) => element !== product);
                                registerDistributors.distributors[i].products = newProduct;
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
                                console.log(registerDistributors.distributors[i]);
                            }
                            break;
                        }
                    }
                }
            }
        }
        if(message.length==0){
            message = "Product currently not available.";
        }
        console.log(message)
    }
    else if(whatNext == 6){
        var distId = prompt("Enter your distributor Id : ");
        var product = prompt('Select the product you wish to buy (1-20) : ');
        var amount_added = prompt('Enter the amount you wish to add to your balance : ');
        for(let i=0; i<registerDistributors.distributors.length; i++){
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
            console.log(message);
        }
        
    }
    else if(whatNext == 7){
        console.log(blockchain.voteValidator());
    }
    else if(whatNext == 8){
        const jsonObject = {
            name: 'John Doe',
            email: 'johndoe@example.com',
            age: 30,
        };
          
        displayQRCode(jsonObject);
    }
    else if(whatNext == 8){
        break;
    }
    whatNext = option();
}

