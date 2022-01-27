/*
 This program simulates a musician, which sends the sound their instrument plays
 on a multicast group. Other programs can join the group and receive the sounds. The
 sounds are transported in json payloads with the following format:

   {"uuid":"aa7d8cb3-a15f-4f06-a0eb-b8feb6244a60","sound":"ti-ta-ti"}

 Usage: to start a musician, launch a musician container
        (of course, you can run several musicians in parallel and observe that all
        sounds are transmitted via the multicast group):

   docker run -d res/musician piano

*/

/*
 * We define the multicast address and port
 */
const PROTOCOL_MULTICAST_ADDRESS = "239.0.0.3";
const PROTOCOL_PORT = 9907;

/*
 * Interval between datagrams
 */
 const INTERVAL_DATAGRAMS = 1000;

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

/*
 * Let's create a datagram socket. We will use it to send our UDP datagrams 
 */
let srv = dgram.createSocket('udp4');

/*
 * To define uuid for the musician
 */
const { v4: uuidv4 } = require('uuid');
const uuid = uuidv4();

/*
 * List of instruments
 */
const instruments_map = new Map();
instruments_map.set("piano", "ti-ta-ti");
instruments_map.set("trumpet", "pouet");
instruments_map.set("flute", "trulu");
instruments_map.set("violin", "gzi-gzi");
instruments_map.set("drum", "boum-boum");

/*
 * Let's define a javascript class for our musician. The constructor accepts
 * an instrument
 */
function musician(instrument) {

	ins = instrument;

  	/*
  	 * We will simulate sound playing on a regular basis. That is something that
  	 * we implement in a class method (via the prototype)
  	 */

		/*
		 * Let's create the sound as a dynamic javascript object, 
		 * add the 3 properties (timestamp, location and temperature)
		 * and serialize the object to a JSON string
		 */
		var msg = {
			uuid: uuid,
			sound: instruments_map.get(ins)
		};
		var payload = JSON.stringify(msg);

	  	/*
	  	 * Finally, let's encapsulate the payload in a UDP datagram, which we publish on
	  	 * the multicast address. All subscribers to this address will receive the message.
	  	 */
		srv.send(payload, PROTOCOL_PORT, PROTOCOL_MULTICAST_ADDRESS);
		console.log("Sending payload: " + payload + " via port " + PROTOCOL_PORT);

}

/*
 * Some error handling wouln't hurt here...
 */
if(process.argv.length != 3) {
	console.error("Missing argument");
	process.exit();
}

var instrument = process.argv[2];
if(instruments_map.get(instrument) == undefined) {
	console.error("Invalid instrument");
	process.exit();
}

/*
 * Let's create a new Musician - the regular publication of sounds will
 * be initiated within the constructor
 */
/*
* Let's take and send a measure every seconds
*/
setInterval(musician, INTERVAL_DATAGRAMS, instrument);