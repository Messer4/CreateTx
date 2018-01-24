var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

io.on('connection', function(socket){
    socket.on('chat message', function(msg){

var data = JSON.parse(msg);
myTx(data.amount,data.address);
        io.emit('chat message', msg);
    });
});


http.listen(3000, function(){
    console.log('listening on *:3000');
});

function myTx(amount,address){
amount=Math.round(Number(amount)*Math.pow(10,8));

console.log(amount);
var bitcore = require("bitcore-lib");

var privateKeyWIF = 'cQN511BWtc2dSUMWySmZpr6ShY1un4WK42JegGwkSFX5a8n9GWr3';

var privateKey = bitcore.PrivateKey.fromWIF(privateKeyWIF);

var sourceAddress = privateKey.toAddress(bitcore.Networks.testnet);

console.log("Source address: " + sourceAddress);

targetAddress = address;//'mnYL1wrFbabjnBagYvu99kvGfE2dccjDgZ';
console.log("Target address: " + targetAddress);

var Insight = require("bitcore-explorers").Insight;
var insight = new Insight('testnet');

insight.getUnspentUtxos(sourceAddress, function(error, utxos) {
    if (error) {
        console.log(error);
    } else {
        console.log(utxos);

        var tx = new bitcore.Transaction();

        tx.from(utxos);
        tx.to(targetAddress, amount);
        tx.change(sourceAddress);
        tx.sign(privateKey);
      //  console.log(tx);
       tx.serialize();

        insight.broadcast(tx, function(error, transactionId) {
            if (error) {
                console.log(error);
            } else {
                console.log(transactionId);
io.emit('chat message', transactionId);
            }
        });

    }
});
};
