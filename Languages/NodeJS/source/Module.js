/*
    Copyright (c) 2021 JDK.FHWS@gmail.com
*/


const { stdin , stdout } = process;

let
  data = [],
  defaultType = null;


/*
    Overwrite Logging
*/

console.log = (...args) => send('log',args);

console.warn = (...args) => send('warn',args);

console.error = (...args) => send('error',args);


/*
    Send Message
*/

function send(type,data){

  if(!data)
    [ type , data ] = [ defaultType , type ];


  return new Promise((resolve) => {


    data = { type , data };


    //  JSON -> String

    data = JSON.stringify(data);


    //  String -> Buffer

    data = Buffer.from(data);


    //  Buffer Size as Header

    const size = Buffer.alloc(4);
    size.writeUInt32LE(data.length,0);


    // Format: [ Length ][ Data ]

    data = Buffer.concat([ size , data ]);


    //  Write & Wait

    if(stdout.write(data))
      process.nextTick(resolve);
    else
      stdout.once('drain',resolve);
  });
}


/*
    Read Message
*/

function readMessage(){

  let chunk;

  while(chunk = stdin.read())
    data.push(chunk);

  parseMessage();
}


/*
    Parse Message
*/

function parseMessage(){

  let msg = Buffer.concat(data);

  data = [];


  //  First 32-bit Int contains msg size + 4 bytes for the Int itself

  const length = msg.readUInt32LE(0) + 4;

  if(length < msg.length)
    return console.error(`Insufficient data!`,length,msg.length,msg);

  if(length > msg.length)
    return console.error(`More data than requested!`,length,msg.length,msg);


  //  Process Content

  msg = msg
    .slice(4,length)
    .toString();


  //  Parse JSON

  let json = {};

  try {
    json = JSON.parse(msg);
  } catch (e) {
    console.error(e);
  }


  //  Extract Data

  const content = json.data || [];

  handler(...content);
}


/*
    Export
*/

module.exports = {

  /*
      Listen To STDIN
  */

  listen: () => {
    stdin.on('readable',readMessage);
  },


  /*
      Handle Incoming Msgs
  */

  handle: (f) => {
    handler = f;
  },


  /*
      Set Custom Default Type
  */

  setDefault: (type) => {
    defaultType = type;
  },


  send
};
