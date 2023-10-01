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
            manuToDist = [];
            let idx=0;
            while(idx<exchange.allTransactions.length){
                if(exchange.allTransactions[idx].type == 1){
                    manuToDist.push(exchange.allTransactions[idx]);
                    exchange.allTransactions.splice(idx,1);
                }
                else{
                    idx++;
                }
            }
            console.log(manuToDist);
            while(manuToDist.length>=2){
                for(let i=0;i<registerDistributors.distributors.length;i++){
                    if(registerDistributors.distributors[i].distributorId==manuToDist[0].buyer){
                        registerDistributors.distributors[i].deposit = parseFloat(registerDistributors.distributors[i].deposit) - parseFloat(manuToDist[1].price);
                        if(registerDistributors.distributors[i].products[manuToDist[0].product]==undefined){
                            registerDistributors.distributors[i].products[manuToDist[0].product] = 1;
                        }
                        else{
                            registerDistributors.distributors[i].products[manuToDist[0].product]++;
                        }
                        manuToDist[0].productId = SHA(manuToDist[0].productId+registerDistributors.distributors[i].privateKey);
                    }
                    if(registerDistributors.distributors[i].distributorId==manuToDist[1].buyer){
                        registerDistributors.distributors[i].deposit = parseFloat(registerDistributors.distributors[i].deposit) - parseFloat(manuToDist[1].price);
                        if(registerDistributors.distributors[i].products[manuToDist[1].product]==undefined){
                            registerDistributors.distributors[i].products[manuToDist[1].product] = 1;
                        }
                        else{
                            registerDistributors.distributors[i].products[manuToDist[1].product]++;
                        }
                        manuToDist[1].productId = SHA(manuToDist[1].productId+registerDistributors.distributors[i].privateKey);
                    }
                }
                const blockData = [manuToDist[0],manuToDist[1]];
                manuToDist.splice(0,2);
                console.log(blockData);
                blockchain.addBlock(blockData);
            }

            while(exchange.allTransactions.length>=2){
                for(let i=0;i<registerDistributors.distributors.length;i++){
                    if(registerDistributors.distributors[i].distributorId==exchange.allTransactions[0].buyer){
                        registerDistributors.distributors[i].deposit = parseFloat(registerDistributors.distributors[i].deposit) + parseFloat(exchange.allTransactions[1].price);
                        if(registerDistributors.distributors[i].products[exchange.allTransactions[0].product]>1){
                            registerDistributors.distributors[i].products[exchange.allTransactions[0].product] --;
                        }
                        else{
                            registerDistributors.distributors[i].products[exchange.allTransactions[0].product]=undefined;
                        }
                        exchange.allTransactions[0].productId = SHA(exchange.allTransactions[0].productId+registerDistributors.distributors[i].privateKey);
                        if(exchange.allTransactions[0].status=="Dispatching"){
                            exchange.allTransactions[0].productId = SHA(exchange.allTransactions[0].productId+registerDistributors.distributors[i].privateKey).toString();
                        }
                        registerDistributors.distributors[i].status=0;
                    }
                    if(registerDistributors.distributors[i].distributorId==exchange.allTransactions[1].buyer){
                        registerDistributors.distributors[i].deposit = parseFloat(registerDistributors.distributors[i].deposit) + parseFloat(exchange.allTransactions[1].price);
                        if(registerDistributors.distributors[i].products[exchange.allTransactions[1].product]>1){
                            registerDistributors.distributors[i].products[exchange.allTransactions[1].product] --;
                        }
                        else{
                            registerDistributors.distributors[i].products[exchange.allTransactions[1].product] = undefined;
                        }
                        exchange.allTransactions[1].productId = SHA(exchange.allTransactions[1].productId+registerDistributors.distributors[i].privateKey);
                        if(exchange.allTransactions[1].status=="Dispatching"){
                            exchange.allTransactions[1].productId = SHA(exchange.allTransactions[1].productId+registerDistributors.distributors[i].privateKey).toString();
                        }
                        registerDistributors.distributors[i].status=0;
                    }
                }
                
                for(let i=0;i<registerClients.clients.length;i++){
                    if(registerClients.clients[i].clientId == exchange.allTransactions[0].buyer){
                        registerClients.clients[i].deposit = parseFloat(registerClients.clients[i].deposit) - parseFloat(exchange.allTransactions[0].price);
                        exchange.allTransactions[0].status="Received";
                        exchange.allTransactions[0].productId = SHA(exchange.allTransactions[0].productId+registerClients.clients[i].privateKey).toString();
                        registerClients.clients[i].purchases.push(exchange.allTransactions[0]);
                    }
                    if(registerClients.clients[i].clientId == exchange.allTransactions[1].buyer){
                        registerClients.clients[i].deposit = parseFloat(registerClients.clients[i].deposit) - parseFloat(exchange.allTransactions[1].price);
                        exchange.allTransactions[1].status="Received";
                        exchange.allTransactions[1].productId = SHA(exchange.allTransactions[1].productId+registerClients.clients[i].privateKey).toString();
                        registerClients.clients[i].purchases.push(exchange.allTransactions[1]);
                    }
                }
                const blockData = [exchange.allTransactions[0],exchange.allTransactions[1]];
                console.log(blockData);
                exchange.allTransactions.splice(0,2);
                blockchain.addBlock(blockData);
            } 
            if(manuToDist.length==1&&exchange.allTransactions.length==1){
                for(let i=0;i<registerDistributors.distributors.length;i++){
                    if(registerDistributors.distributors[i].distributorId==manuToDist[0].buyer){
                        registerDistributors.distributors[i].deposit = parseFloat(registerDistributors.distributors[i].deposit) - parseFloat(manuToDist[1].price);
                        if(registerDistributors.distributors[i].products[manuToDist[0].product]==undefined){
                            registerDistributors.distributors[i].products[manuToDist[0].product] = 1;
                        }
                        else{
                            registerDistributors.distributors[i].products[manuToDist[0].product]++;
                        }
                        manuToDist[0].productId = SHA(manuToDist[0].productId+registerDistributors.distributors[i].privateKey);
                    }
                }
                for(let i=0;i<registerDistributors.distributors.length;i++){
                    if(registerDistributors.distributors[i].distributorId==exchange.allTransactions[0].buyer){
                        registerDistributors.distributors[i].deposit = parseFloat(registerDistributors.distributors[i].deposit) + parseFloat(exchange.allTransactions[1].price);
                        if(registerDistributors.distributors[i].products[exchange.allTransactions[0].product]>1){
                            registerDistributors.distributors[i].products[exchange.allTransactions[0].product] --;
                        }
                        else{
                            registerDistributors.distributors[i].products[exchange.allTransactions[0].product]=undefined;
                        }
                        exchange.allTransactions[0].productId = SHA(exchange.allTransactions[0].productId+registerDistributors.distributors[i].privateKey);
                        if(exchange.allTransactions[0].status=="Dispatching"){
                            exchange.allTransactions[0].productId = SHA(exchange.allTransactions[0].productId+registerDistributors.distributors[i].privateKey).toString();
                        }
                        registerDistributors.distributors[i].status=0;
                    }
                }
                
                for(let i=0;i<registerClients.clients.length;i++){
                    if(registerClients.clients[i].clientId == exchange.allTransactions[0].buyer){
                        registerClients.clients[i].deposit = parseFloat(registerClients.clients[i].deposit) - parseFloat(exchange.allTransactions[0].price);
                        exchange.allTransactions[0].status="Received";
                        exchange.allTransactions[0].productId = SHA(exchange.allTransactions[0].productId+registerClients.clients[i].privateKey).toString();
                        registerClients.clients[i].purchases.push(exchange.allTransactions[0]);
                    }
                }
                const blockData = [exchange.allTransactions[0],manuToDist[0]];
                exchange.allTransactions.splice(0,1);
                console.log(blockData);
                blockchain.addBlock(blockData);
            }
            else if(manuToDist.length==1){
                exchange.allTransactions.push(manuToDist[0]);
            }
        }
        else{
            exchange.allTransactions=[];
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
        if(registerClients.clients.length==0){
            message='Client Not Found';
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
            if(registerDistributors.distributors[i].products[product]){
                for(let k=0; k<registerClients.clients.length && !message.length; k++){
                    if(registerClients.clients[k].clientId == clientId){
                        if(parseFloat(registerClients.clients[k].deposit) - parseFloat(exchange.prices[product-1]) < parseFloat(registerClients.minDeposit)){
                            message=`Couldnt purchase the product ${product} as your minimum balance after purchase will be less than ${registerClients.minDeposit}`;
                        }
                        else{
                            dist_status = "Dispatching";
                            key = SHA(product+clientId+registerDistributors.distributors[i].distributorId+Date.now()).toString();
                            if(registerDistributors.distributors[i].status==0){
                                dist_status = "Dispatched";
                                key = SHA(key+registerDistributors.distributors[i].privateKey).toString();
                            }
                            if(registerDistributors.distributors[i].products[product]>1){
                                registerDistributors.distributors[i].products[product]--;
                            }
                            else{
                                registerDistributors.distributors[i].products[product]=undefined;
                            }
                            const new_D_to_C_transaction={
                                buyer:clientId,
                                product:product,
                                price:exchange.prices[product-1],
                                seller:registerDistributors.distributors[i].distributorId,
                                type:0,
                                timestamp: Date.now(),
                                productId : key,
                                status: dist_status,
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
                    // registerDistributors.distributors[i].deposit = parseFloat(registerDistributors.distributors[i].deposit) - parseFloat(exchange.prices[product-1]);
                    // registerDistributors.distributors[i].products.push(product);
                    const new_M_to_D_transaction={
                        buyer:distId,
                        product:product,
                        price:exchange.prices[product-1],
                        seller:"Manufacturer",
                        type:1,
                        timestamp: Date.now(),
                        productId : SHA(product+distId+"Manufacturer"+Date.now()).toString(),
                    }
                    exchange.allTransactions.push(new_M_to_D_transaction);
                    message="Success!! Product bought";
                }
                console.log(registerDistributors.distributors[i]);
            }
            else if(i == registerDistributors.distributors.length - 1){
                message = 'Distributor Not Found';
            }
        }
        if(registerDistributors.distributors.length==0){
            message = 'Distributor Not Found';
        }
        console.log(message);
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

