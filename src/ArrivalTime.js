var JSDOM = require("jsdom").JSDOM;
var _ = require('underscore');
var Q = require('q');

module.exports = ArrivalTime;

function ArrivalTime (station, targets) {
    if(!station || !targets) {
        throw 'No Station or direction was given';
        return;
    }

    this.station = station;

    this.targets = this.tidyUp(targets);
}

ArrivalTime.prototype.tidyUp = function(stations) {
    if(_.isString(stations)) {
        return [stations];
    } else {
        return _.map(stations, function(n) {
            return n.toLowerCase()
        });
    }
}

ArrivalTime.prototype.buildUrl = function() {
    var date = new Date(),
        hour = date.getHours(),
        minute = date.getMinutes();

    return 'http://reiseauskunft.bahn.de/bin/bhftafel.exe/dn?country=DEU&rt=1&input=' + this.station + '&start=1&time=' + hour + ':' + minute;
}

ArrivalTime.prototype.getResults = function() {
    var self = this,
        url = this.buildUrl(),
        results = [],
        targets = this.targets,
        deferred = Q.defer();

    JSDOM
        .fromURL(url)
        .then(function (dom) {
            dom.window.document
                .querySelectorAll('[id^="journeyRow"]')
                .forEach(function (row) {
                    var link = row.querySelector('.route .bold a');
                    var text = link.textContent.trim().toLowerCase();

                    if (_.contains(targets, text)) {
                        results.push(self.validateResult(row));
                    }
                });

            deferred.resolve(results);
        })
        .catch(function (e) {
            console.error(e.message || e);
        });

    return deferred.promise;
};

ArrivalTime.prototype.validateResult = function(result) {

    var date = new Date(),
        time = result.querySelector('.time').textContent.trim().split(':'),
        start = this.station;

        date.setHours(time[0]);
        date.setMinutes(time[1]);

    return {
        time: date,
        name: result.querySelector('.train + .train a').textContent.trim().replace(/      /g, ' '),
        start: start,
        direction: result.querySelector('.route .bold a').textContent.trim(),
        delay: parseInt(result.querySelector('.ris span').textContent, 10) || 0
    };
};

