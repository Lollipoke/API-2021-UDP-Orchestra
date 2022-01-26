/*
 This program simulates a concert, which joins a multicast
 group in order to receive sounds produced by musicians.
 The measures are transported in json payloads with the following format:

   {"uuid" : "aa7d8cb3-a15f-4f06-a0eb-b8feb6244a60", "instrument" : "piano", "activeSince" : "2016-04-27T05:39:03.211Z"}

 Usage: to start the auditor, start an Auditor container with the following command

   docker run -d -p 2205:2205 api/auditor
*/

/*
 * We define the multicast address and port
 */
const UDP_PROTOCOL_MULTICAST_ADDRESS = "239.255.22.5";
const UDP_PROTOCOL_PORT = 9907;
const TCP_PROTOCOL_PORT = 2205;

/*
 * Interval to consider a musician active
 */
 const INTERVAL_ACTIVE = 5000;


/*
 * List of instruments
 */
const instruments_map = new Map();
instruments_map.set("ti-ta-ti", "piano");
instruments_map.set("pouet", "trumpet");
instruments_map.set("trulu", "flute");
instruments_map.set("gzi-gzi", "violin");
instruments_map.set("boum-boum", "drum");

/*
 * List of active musicians
 */
var musicians = new Map();

/*
 * We use a standard Node.js module to work with UDP
 */
const dgram = require('dgram');

/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by musicians and containing ''sounds''
 */
const s = dgram.createSocket('udp4');
s.bind(UDP_PROTOCOL_PORT, function() {
  console.log("Joining multicast group");
  s.addMembership(UDP_PROTOCOL_MULTICAST_ADDRESS);
});

/* 
 * This call back is invoked when a new datagram has arrived.
 */
s.on('message', function(msg, source) {
  var time = Date.now();
  var parseMsg = JSON.parse(msg);
  var musician = musicians.get(parseMsg.uuid);

  // If musician is not in the list, add it
  if (musician == undefined) {
    musicians.set(parseMsg.uuid, {instrument:instruments_map.get(parseMsg.sound), start:time, last:time});
  } else if (now - musician.last < INTERVAL_ACTIVE) {
    // Musician has been active within 5 seconds
    musicians.set(parseMsg.uuid, {instrument:musician.instrument, start:musician.start, last:time});
  }
});


/*
 * We use a standard Node.js module to work with TCP
 */
const net = require('net');

/*
 * Create a TCP server that accepts connection on port 2205 and sends the list
 * of active musicians  
 */ 
const server = net.createServer(function(socket) {
  socket.write('Echo server\r\n');
  socket.pipe(socket);
});

server.listen(TCP_PROTOCOL_PORT, '127.0.0.1');

server.on('connect', function(msg, source) {
  var time = Date.now();

  // Remove inactive musicians
  musicians.forEach((v, k) => {
    if(time - v.last > INTERVAL_ACTIVE) {
      console.log("Remove musician: ", k);
      musicians.delete(k);
    };
  });

  var msg = JSON.stringify(musicians);
  socket.write(msg);
  socket.write("\n");
  socket.end();
});
