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
 * List of active musicians
 */
var musicians = [];

/*
 * We use a standard Node.js module to work with UDP
 */
const dgram = require('dgram');

/*
 * We use a standard Node.js module to work with TCP
 */
const net = require('net');

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
  console.log("Data has arrived: " + msg + ". Source port: " + source.port);
});


/*
 * Create a TCP server that accepts connection on port 2205 and sends the list
 * of active musicians  
 */ 
const server = net.createServer(function(socket) {
  socket.write('Echo server\r\n');
  socket.pipe(socket);
});

server.listen(TCP_PROTOCOL_PORT, '127.0.0.1');