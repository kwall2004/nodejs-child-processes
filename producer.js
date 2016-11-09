var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (err, conn) {
  conn.createChannel(function (err, ch) {
    var queueName = process.argv[2];
    var message = 'test';
    var number = parseInt(process.argv[3]);

    ch.assertQueue(queueName, { durable: true });
    for (i = 0; i < number; i++) {
      ch.sendToQueue(queueName, new Buffer(message + i));
      console.log(" [x] Sent %s", message + i);
    }
  });
  setTimeout(function () { conn.close(); process.exit(0) }, 500);
});