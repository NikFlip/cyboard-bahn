var events = require('events'),
    Q = require('q'),
    ArrivalTime = require('./src/ArrivalTime'),
    _ = require('underscore');

module.exports = function(widgets, templates, styles) {

    templates.push('./templates');

    styles.addWidgetStylesheet('bahn', './styles/bahn.scss');

    widgets.register('bahn', function(options) {
        var emitter = new events.EventEmitter,
            arrivals = [];

        options.connections.forEach(function(connection) {
            arrivals.push(new ArrivalTime(connection.start, connection.stop))
        });

        function go() {
            var promises = [];
            arrivals.forEach(function(arrival) {
                promises.push(arrival.getResults());
            });

            Q.all(promises).then(function(results) {
                emitter.emit('data', {arrivals: _.flatten(results)});
            })

            setTimeout(go, options.interval || 15 * 60000)
        }

        process.nextTick(go);

        return emitter;
    });

};

module.exports.$inject = ['widgetFactory', 'templateManager', 'stylesManager'];