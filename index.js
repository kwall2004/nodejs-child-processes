var settings = require('./settings');
var amqpStats = require('amqp-stats');
var spawn = require('child_process').spawn;

var queueName = 'test';
var stats = new amqpStats({
    username: settings.username,
    password: settings.password,
    hostname: settings.hostname,
    protocol: settings.protocol
});

var consumers = [];
consumers.push(spawn('node', ['./consumer.js', queueName]));
consumers.push(spawn('node', ['./consumer.js', queueName]));
consumers.forEach(function (consumer) {
    watchConsumer(consumer);
});

function watchConsumer(consumer) {
    consumer.stdout.on('data', function (data) {
        console.log(consumer.pid + ' stdout: ' + data);
    });
    consumer.stderr.on('data', function (data) {
        console.log(consumer.pid + ' stderr: ' + data);
    });
    consumer.on('close', function (code) {
        console.log(consumer.pid + ' closing code: ' + code);
    });
}

setInterval(function () {
    stats.queues(function (err, res, data) {
        var messages_ready = data.find(function (queue) {
            return queue.name === queueName;
        }).messages_ready;

        if (messages_ready > settings.maxQueueLength) {
            var consumer = spawn('node', ['./consumer.js', queueName]);
            consumers.push(consumer);
            watchConsumer(consumer);
        }
        else if (messages_ready == 0 && consumers.length > settings.minConsumersLength) {
            var consumer = consumers.splice(consumers.length - 1, 1)[0];
            consumer.kill();
        }
    });
}, 1000);