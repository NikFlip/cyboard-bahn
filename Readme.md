#Cyboard Bahn Widget

This module displays upcomming arrival times of the Deutsche Bahn.

##How to use

1. install the [cyboard](https://www.npmjs.com/package/cyboard "cyboard") wallboard: `npm install cyboard`
2. install the plugin `npm install cyboard-bahn`
3. add it to your wallboard and style it

##Example

```
var server = require('cyboard')(),
    board = server.createBoard('Team A');

board.addWidget('bahn', {
    top: 1,
    left: 1,
    width: 6,
    height: 2,
    connections: [{
        start: 'Köln-Ehrenfeld',
        stop: ['Paderborn Hbf', 'Hamm(Westf)']
    }]
});

server.listen(3000, function() {
    console.info("Server listening on http://localhost:%s", 3000);
});
```

###Upcomming

- writing tests
- add translations