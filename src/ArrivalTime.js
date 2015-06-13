var jsdom = require("jsdom"),
    _ = require('underscore'),
    Q = require('q');

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

    jsdom.env(
        url,
        ["http://code.jquery.com/jquery.js"],
        function (errors, window) {
            var $ = window.$;

            $('[id^="journeyRow"]').each(function() {
                var text = $(this).find('.route .bold a').text().trim().toLowerCase().trim();
                
                if (_.contains(targets, text)) {
                    results.push(self.validateResult($(this)));
                }
            });

            deferred.resolve(results);
        }
    );

    return deferred.promise;
};

ArrivalTime.prototype.validateResult = function(result) {

    var date = new Date(),
        time = result.find('.time').text().trim().split(':'),
        start = this.station;

        date.setHours(time[0]);
        date.setMinutes(time[1]);

    var results = {
        time: date,
        name: result.find('.train + .train a').text().trim().replace(/      /g, ' '),
        start: start,
        direction: result.find('.route .bold a').text().trim(),
        delay: parseInt(result.find('.ris span:first').text(), 10) || 0
    };
    return results;
};

