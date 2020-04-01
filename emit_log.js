#!/usr/bin/env node

var amqp = require('amqplib');

amqp.connect('amqp://support:admin@10.180.112.3').then(function(conn) {
  return conn.createChannel().then(function(ch) {
    var ex = 'pz_mobile_log';
    var ok = ch.assertExchange(ex, 'direct', {durable: true})

    var message = process.argv.slice(2).join(' ') ||
      'info: Hello World!';

    return ok.then(function() {
      ch.publish(ex, '', Buffer.from(message));
      console.log(" [x] Sent '%s'", message);
      return ch.close();
    });
  }).finally(function() { conn.close(); });
}).catch(console.warn);
console.log("end");
