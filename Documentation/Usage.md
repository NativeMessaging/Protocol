
# Usage

<br>

```javascript

const { send , handle , listen } = require('native-msg');


//  Handle incoming messages

handle((message) => {
    
    if(message === 'Bake the cakes!')
        send(`The cakes have been baked!`);
});


//  Start listening to STDIN

listen();

```
