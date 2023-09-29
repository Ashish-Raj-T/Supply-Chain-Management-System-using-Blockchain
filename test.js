const Blockchain = require('./blockchain');
const Registration = require('./registration');
const Transaction = require('./transaction');
const buyDistributeSell = new Transaction();
const bitcoin = new Blockchain();
const RegisterClient = require('./transaction');
const RegisterDistributor = require('./transaction');
const SHA256 = require('sha256');
const prompt = require('prompt-sync')
const _prevHash = bitcoin.chain[0].prevHash;

// Printing the genesis block in terminal
console.log(bitcoin.chain[0]);

var _transactionNum = 0;
var n=1, m=1;
var TXLength = 0; // to store number of new transactions created

function options(){
    var temp = prompt(
        "Select any one of the following : \n" +
        "Click 0 : Add transactions \n" +
        "Click 1 : See transactions added \n" +
        "Click 2 : Start mining block \n" +
        "Click 3 : Register New client\n" +
        "Click 4 : Register New Distributor\n" +
        "Click 5 : Buy Product\n" +
        "Click 6 : Sell Product\n" + 
        "Click 7 : Exit\n"
    )

    return temp ;
}


var whatNext = options();

while(whatNext != 7){
    // To see Transaction history of a product
    if(whatNext == 1){
        var transId = prompt("Product ID: ");
        for(let i=0; i<bitcoin.newTransaction.length; i++){
            if(transId == bitcoin.newTransaction[i].id){
                console.log(bitcoin.newTransaction[i]);
                break;
            }
        }
        let owned = 0;
        // Transaction is stored in "transHistory" array of buyDistributeSell function
        for(let j=0; j<buyDistributeSell.transHistory.length-1; j++){
            if(transId == buyDistributeSell.transHistory[2*j + 1]){
                if(owned == 0){
                    //the buyer of the property
                    console.log("Owner : " +  buyDistributeSell.transHistory[2*j] + " Property Id : " + buyDistributeSell.transHistory[2*j+1]);
                    owned = 1;
                }
                
                else {
                    //the seller of the property
                    console.log("seller : " +  buyDistributeSell.transHistory[2*j] + " Property Id : " + buyDistributeSell.transHistory[2*j+1]);
                    owned = 0;
                }
            }
        }
        whatNext = options();
    }

    else if(whatNext == 2){
        
    }
}