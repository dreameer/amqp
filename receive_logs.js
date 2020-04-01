#!/usr/bin/env node

var amqp = require('amqplib');
var fs = require('fs');
amqp.connect('amqp://support:admin@localhost').then(function(conn) {
  process.once('SIGINT', function() { conn.close(); });
  return conn.createChannel().then(function(ch) {
    var ok = ch.assertExchange('pz_mobile_log', 'direct', {durable: true});
    ok = ok.then(function() {
      return ch.assertQueue('', {exclusive: true});
    });
    ok = ok.then(function(qok) {
      return ch.bindQueue(qok.queue, 'pz_mobile_log', '').then(function() {
        return qok.queue;
      });
    });
    ok = ok.then(function(queue) {
      return ch.consume(queue, logMessage, {noAck: true});
    });
    return ok.then(function() {
      console.log(' [*] Waiting for logs. To exit press CTRL+C');
    });

    function logMessage(msg) {
      var message = msg.content.toString();
      console.log( message);
      fs.appendFile('/var/log/mobile_audit.log',message,(err)=>{
         if(err) throw err;
      });
    }
  });
}).catch(console.warn);
