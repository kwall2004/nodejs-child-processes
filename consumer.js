var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (err, conn) {
	conn.createChannel(function (err, ch) {
		var queueName = process.argv[2];

		ch.assertQueue(queueName, { durable: true });
		ch.prefetch(1);
		console.log(" [*] Waiting for messages in %s", queueName);
		ch.consume(queueName, function (message) {
			var seconds = (message.content.toString().split('.').length - 1) * 5;

			console.log(" [x] Received %s", message.content.toString());
			setTimeout(function () {
				console.log(" [x] Done");
				ch.ack(message);
			}, seconds * 1000);
		});
	});
});