const Blockchain = require('./blockchain');
const transaction = require('./transaction');
const {RegisterClient,RegisterDistributor} = require('./registration');
const SHA = require("sha256");
const prompt = require('prompt-sync')();
const QRCode = require('qrcode-terminal');

const exchange = new transaction();
const blockchain = new Blockchain();
const registerClients = new RegisterClient();
const registerDistributors = new  RegisterDistributor();

// function to generate productKey while generating QR Code
function generateKey(productKey){
    for(let i=0;i<blockchain.blockchain.length;i++){
        for(let j=0;j<blockchain.blockchain[i].data.length;j++){
            temp_key = productKey;
            for(let k=0;k<registerDistributors.distributors.length;k++){
                if(registerDistributors.distributors[k].distributorId==blockchain.blockchain[i].data[j].seller){
                    temp_key = SHA(temp_key+registerDistributors.distributors[k].privateKey).toString();
                    break;
                }
            }
            for(let k=0;k<registerClients.clients.length;k++){
                if(registerClients.clients[k].clientId==blockchain.blockchain[i].data[j].buyer){
                    temp_key = SHA(temp_key+registerClients.clients[k].privateKey).toString();
                    break;
                }
            }
            if(temp_key==blockchain.blockchain[i].data[j].productId){
                return blockchain.blockchain[i].data[j];
            }
        }
    }
    for(let i=0;i<exchange.allTransactions.length;i++){
        temp_key = productKey;
        if(temp_key==exchange.allTransactions[i].productId){
            return exchange.allTransactions[i];
        }
        for(let k=0;k<registerDistributors.distributors.length;k++){
            if(registerDistributors.distributors[k].distributorId==exchange.allTransactions[i].seller){
                temp_key = SHA(temp_key+registerDistributors.distributors[k].privateKey).toString();
                break;
            }
        }
        if(temp_key==exchange.allTransactions[i].productId){
            return exchange.allTransactions[i];
        }
    }
    return "Invalid Product Key";
}

// function to generate QR Code
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
    'Click 0: Print Genesis Block',
    'Click 1: See transactions added',
    'Click 2: Start mining block',
    'Click 3: Register New client',
    'Click 4: Register New Distributor',
    'Click 5: Buy Product as a client',
    'Click 6: Buy Product as a distributor',
    'Click 7: Vote',
    'Click 8: Display QR Code',
    'Click 9: Report Dispute',
    'Click 10: Print Blockchain',
    'Click 11: Exit'
    ];

    console.log(message);
    options.forEach(option => console.log(option));
    const userInput = prompt('Enter your choice (0-11): ');
    let choice = parseInt(userInput);
    
    if (!isNaN(choice) && choice >= 0 && choice < options.length) {
        console.log(`You selected: ${options[choice]}`);
        console.log();
    } 
    else {
        console.log('Invalid choice. Please select a valid option.');
        console.log();
    }
    return choice;
}

var whatNext = option();


while(whatNext != 11){
    // Printing genesis block
    if(whatNext == 0){
        const firstHash = blockchain.blockchain[0];
        console.log('Genesis :',firstHash);
    }
    // To see all the Transactions
    else if(whatNext == 1){
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
    // Start Mining Block
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

            //mining the transactions between distributors and manufacturers
            while(manuToDist.length>=2){
                for(let i=0;i<registerDistributors.distributors.length;i++){
                    if(registerDistributors.distributors[i].distributorId==manuToDist[0].buyer){
                        registerDistributors.distributors[i].deposit = Number(registerDistributors.distributors[i].deposit) - Number(manuToDist[1].price);
                        if(registerDistributors.distributors[i].products[manuToDist[0].product]==undefined){
                            registerDistributors.distributors[i].products[manuToDist[0].product] = 1;
                        }
                        else{
                            registerDistributors.distributors[i].products[manuToDist[0].product]++;
                        }
                        manuToDist[0].productId = SHA(manuToDist[0].productId+registerDistributors.distributors[i].privateKey).toString();
                    }
                    if(registerDistributors.distributors[i].distributorId==manuToDist[1].buyer){
                        registerDistributors.distributors[i].deposit = Number(registerDistributors.distributors[i].deposit) - Number(manuToDist[1].price);
                        if(registerDistributors.distributors[i].products[manuToDist[1].product]==undefined){
                            registerDistributors.distributors[i].products[manuToDist[1].product] = 1;
                        }
                        else{
                            registerDistributors.distributors[i].products[manuToDist[1].product]++;
                        }
                        manuToDist[1].productId = SHA(manuToDist[1].productId+registerDistributors.distributors[i].privateKey).toString();
                    }
                }
                const blockData = [manuToDist[0],manuToDist[1]];
                manuToDist.splice(0,2);
                console.log(blockData);
                blockchain.addBlock(blockData);
            }

            // mining the transactions betweeen distributors and clients
            while(exchange.allTransactions.length>=2){
                for(let i=0;i<registerDistributors.distributors.length;i++){
                    if(registerDistributors.distributors[i].distributorId==exchange.allTransactions[0].buyer){
                        registerDistributors.distributors[i].deposit = Number(registerDistributors.distributors[i].deposit) + Number(exchange.allTransactions[1].price);
                        if(registerDistributors.distributors[i].products[exchange.allTransactions[0].product]>1){
                            registerDistributors.distributors[i].products[exchange.allTransactions[0].product]--;
                        }
                        else{
                            registerDistributors.distributors[i].products[exchange.allTransactions[0].product]=undefined;
                        }
                        exchange.allTransactions[0].productId = SHA(exchange.allTransactions[0].productId+registerDistributors.distributors[i].privateKey).toString();
                        if(exchange.allTransactions[0].status=="Dispatching"){
                            exchange.allTransactions[0].productId = SHA(exchange.allTransactions[0].productId+registerDistributors.distributors[i].privateKey).toString();
                        }
                        registerDistributors.distributors[i].status=0;
                    }
                    if(registerDistributors.distributors[i].distributorId==exchange.allTransactions[1].buyer){
                        registerDistributors.distributors[i].deposit = Number(registerDistributors.distributors[i].deposit) + Number(exchange.allTransactions[1].price);
                        if(registerDistributors.distributors[i].products[exchange.allTransactions[1].product]>1){
                            registerDistributors.distributors[i].products[exchange.allTransactions[1].product]--;
                        }
                        else{
                            registerDistributors.distributors[i].products[exchange.allTransactions[1].product] = undefined;
                        }
                        exchange.allTransactions[1].productId = SHA(exchange.allTransactions[1].productId+registerDistributors.distributors[i].privateKey).toString();
                        if(exchange.allTransactions[1].status=="Dispatching"){
                            exchange.allTransactions[1].productId = SHA(exchange.allTransactions[1].productId+registerDistributors.distributors[i].privateKey).toString();
                        }
                        registerDistributors.distributors[i].status=0;
                    }
                }
                
                for(let i=0;i<registerClients.clients.length;i++){
                    if(registerClients.clients[i].clientId == exchange.allTransactions[0].buyer){
                        registerClients.clients[i].deposit = Number(registerClients.clients[i].deposit) - Number(exchange.allTransactions[0].price);
                        exchange.allTransactions[0].status="Received";
                        exchange.allTransactions[0].productId = SHA(exchange.allTransactions[0].productId+registerClients.clients[i].privateKey).toString();
                        registerClients.clients[i].purchases.push(exchange.allTransactions[0]);
                    }
                    if(registerClients.clients[i].clientId == exchange.allTransactions[1].buyer){
                        registerClients.clients[i].deposit = Number(registerClients.clients[i].deposit) - Number(exchange.allTransactions[1].price);
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

            // if we have on trasaction each in both types, we can create a block mining both of them
            if(manuToDist.length==1&&exchange.allTransactions.length==1){
                for(let i=0;i<registerDistributors.distributors.length;i++){
                    if(registerDistributors.distributors[i].distributorId==manuToDist[0].buyer){
                        registerDistributors.distributors[i].deposit = Number(registerDistributors.distributors[i].deposit) - Number(manuToDist[1].price);
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
                        registerDistributors.distributors[i].deposit = Number(registerDistributors.distributors[i].deposit) + Number(exchange.allTransactions[1].price);
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
                        registerClients.clients[i].deposit = Number(registerClients.clients[i].deposit) - Number(exchange.allTransactions[0].price);
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
    // registering new client
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
    // registering new distributor
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
    // buying a product as a client
    else if(whatNext == 5){
        var clientId = prompt('Enter your client Id : ');
        let message = "";
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
                        if(Number(registerClients.clients[k].deposit) - Number(exchange.prices[product-1]) < Number(registerClients.minDeposit)){
                            message=`Couldnt purchase the product ${product} as your minimum balance after purchase will be less than ${registerClients.minDeposit}`;
                        }
                        else{
                            dist_status = "Dispatching";
                            key = SHA(product+clientId+registerDistributors.distributors[i].distributorId+Date.now()).toString();
                            console.log(`Please store the product key ${key} to track the status of your purchase.`);
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
    // buying product as a distributor
    else if(whatNext == 6){
        let message = "";
        var distId = prompt("Enter your distributor Id : ");
        var product = prompt('Select the product you wish to buy (1-20) : ');
        var amount_added = prompt('Enter the amount you wish to add to your balance : ');
        for(let i=0; i<registerDistributors.distributors.length; i++){
            if(registerDistributors.distributors[i].distributorId==distId){
                registerDistributors.distributors[i].deposit = Number(registerDistributors.distributors[i].deposit) + Number(amount_added);
                if((registerDistributors.distributors[i].deposit) - (exchange.prices[product-1]) < (registerDistributors.minDeposit)){
                    message=`Couldnt purchase the product ${product} as your minimum balance after purchase will be less than ${registerDistributors.minDeposit}`;
                }
                else{
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
    // voting for all the validators
    else if(whatNext == 7){
        console.log(blockchain.voteValidator());
    }
    // displaying QR Code of the transaction
    else if(whatNext == 8){
        var productKey = prompt("Please enter the product key to track the purchase : ");
        displayQRCode(generateKey(productKey));
    }
    // settling disputes using blockchain
    else if(whatNext == 9){
        console.log("Terms : Before proceeding, please note that we thoroughly investigate reported issues to ensure fairness and honesty.\n We rely on evidence and facts to resolve any discrepancies, ensuring a transparent resolution process.\n Additionally, in cases of proven dishonesty, a deduction of 50 from the security deposit will be applied, ensuring a fair resolution process for all parties involved.\n");
        var cid = prompt("Enter your id : ");
        var productKey = prompt("Please enter the product key for the disputed product : ");
        var recheck = productKey;
        // prompt("Please re-enter the product key for the disputed product. Submitting an Invalid product key will result in deduction of 50 for your security deposit : ");
        if(productKey!=recheck){
            "The keys don't match";
        }
        transactionStatus = generateKey(productKey);
        if(transactionStatus == "Invalid Product Key"&&productKey==recheck){
            console.log("The Product key you have entered is Invalid, enter a correct product key");
            for(let i=0;i<registerClients.clients.length;i++){
                if(registerClients.clients[i].clientId==cid){
                    registerClients.clients[i].deposit -= 50;
                    console.log(`Your current deposit has been reduced to ${registerClients.clients[i].deposit}`);
                }
            }
        }
        else if(productKey===recheck){
            if(transactionStatus.status=="Dispatched"||transactionStatus.status=="Dispatching"){
                console.log(`The transaction is being validated. The current status of the product is ${transactionStatus.status}`);
                for(let i=0;i<registerDistributors.distributors.length;i++){
                    if(registerDistributors.distributors[i].distributorId==transactionStatus.seller){
                        registerDistributors.distributors[i].deposit -= 50;
                        console.log(`The Distributor's current deposit has been reduced to ${registerDistributors.distributors[i].deposit}`);
                    }
                }
            }
            else if(transactionStatus.status=="Received"){
                console.log("The product has been delivered. Please generate QR code to check your transaction status.");
                for(let i=0;i<registerClients.clients.length;i++){
                    if(registerClients.clients[i].clientId==cid){
                        registerClients.clients[i].deposit -= 50;
                        console.log(`Your current deposit has been reduced to ${registerClients.clients[i].deposit}`);
                    }
                }
            }
        }
    }
    // printing all the transactions using blockchain
    else if(whatNext == 10){
        blockchain.printBLockchain();
    }
    else if(whatNext == 11){
        break;
    }
    whatNext = option();
}
