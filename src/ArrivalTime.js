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
        minute = date.getMinutes(),
        url = 'http://reiseauskunft.bahn.de/bin/bhftafel.exe/dn?country=DEU&rt=1&input=' + this.station + '&start=1&time=' + hour + ':' + minute;

    return url;
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
                    if (link.textContent) {
                        var text = link.textContent.trim().toLowerCase();

                        if (_.contains(targets, text)) {
                            results.push(self.validateResult(row));
                        }
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
        start = this.station.replace(/%.*$/, ''),
        name = '',
        direction = '',
        delay = '';

    if (result.querySelector('.train + .train a')) name = result.querySelector('.train + .train a').textContent;
    if (result.querySelector('.route .bold a')) direction = result.querySelector('.route .bold a').textContent;
    if (result.querySelector('.ris span')) delay = result.querySelector('.ris span').textContent;

    date.setHours(time[0]);
    date.setMinutes(time[1]);

    return {
        time: date,
        name: name.trim().replace(/      /g, ' '),
        start: start,
        direction: direction.trim(),
        delay: parseInt(delay, 10) || 0
    };
};
