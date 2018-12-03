

	// Define "global" variables
	
	var connectButton = null;
	var disconnectButton = null;
	var sendButton = null;
	var messageInputBox = null;
	var receiveBox = null;
	
	var localConnection = null;   // RTCPeerConnection for our "local" connection
	var remoteConnection = null;  // RTCPeerConnection for the "remote"
	
	var sendChannel = null;       // RTCDataChannel for the local (sender)
	var receiveChannel = null;    // RTCDataChannel for the remote (receiver)
	
	// Functions
	
	// Set things up, connect event listeners, etc.
	
	function startup() {
	  connectButton = document.getElementById('connectButton');
	  disconnectButton = document.getElementById('disconnectButton');
	  sendButton = document.getElementById('sendButton');
	  messageInputBox = document.getElementById('message');
	  receiveBox = document.getElementById('receivebox');
	  // Set event listeners for user interface widgets
  
	  connectButton.addEventListener('click', connectPeers, false);
	  disconnectButton.addEventListener('click', disconnectPeers, false);
	  sendButton.addEventListener('click', sendMessage, false);
	}
	
	// Connect the two peers. Normally you look for and connect to a remote
	// machine here, but we're just connecting two local objects, so we can
	// bypass that step.
	
	function connectPeers() {
	  // Create the local connection and its event listeners
	  
	  localConnection = new RTCPeerConnection();
	  
	  // Create the data channel and establish its event listeners
	  sendChannel = localConnection.createDataChannel("sendChannel");
	  sendChannel.onopen = handleSendChannelStatusChange;
	  sendChannel.onclose = handleSendChannelStatusChange;
	  
	  // Create the remote connection and its event listeners
	  
	  remoteConnection = new RTCPeerConnection();
	  remoteConnection.ondatachannel = receiveChannelCallback;
	  
	  // Set up the ICE candidates for the two peers
	  
	  localConnection.onicecandidate = e => !e.candidate
		  || remoteConnection.addIceCandidate(e.candidate)
		  .catch(handleAddCandidateError);
  
	  remoteConnection.onicecandidate = e => !e.candidate
		  || localConnection.addIceCandidate(e.candidate)
		  .catch(handleAddCandidateError);
	  
	  // Now create an offer to connect; this starts the process
	  
	  createLocalConnection()
	  .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
	  .then(() => remoteConnection.createAnswer())
		.then(answer => remoteConnection.setLocalDescription(answer))
		.then(() => getRemoteDescription(remoteConnection.localDescription));
	 
	 
	}
	function createLocalConnection() {
		return localConnection.createOffer()
		.then(offer => localConnection.setLocalDescription(offer))
		.then(() => sendLocalDescription(localConnection.localDescription));
	}
	function getRemoteDescription(desc) {
		localConnection.setRemoteDescription(desc)
		//.catch(handleCreateDescriptionError);
	}
	// Handle errors attempting to create a description;
	// this can happen both when creating an offer and when
	// creating an answer. In this simple example, we handle
	// both the same way.
	
	function handleCreateDescriptionError(error) {
	  console.log("Unable to create an offer: " + error.toString());
	}
	
	// Handle successful addition of the ICE candidate
	// on the "local" end of the connection.
	
	function handleLocalAddCandidateSuccess() {
	  connectButton.disabled = true;
	}
  
	// Handle successful addition of the ICE candidate
	// on the "remote" end of the connection.
	
	function handleRemoteAddCandidateSuccess() {
	  disconnectButton.disabled = false;
	}
  
	// Handle an error that occurs during addition of ICE candidate.
	
	function handleAddCandidateError() {
	  console.log("Oh noes! addICECandidate failed!");
	}
  
	// Handles clicks on the "Send" button by transmitting
	// a message to the remote peer.
	
	function sendMessage() {
	  //var message = messageInputBox.value;
	  //sendChannel.send(message);
	  
	  // Clear the input box and re-focus it, so that we're
	  // ready for the next message.
	  
	  messageInputBox.value = "";
	  messageInputBox.focus();
	}
	
	// Handle status changes on the local end of the data
	// channel; this is the end doing the sending of data
	// in this example.
	
	function handleSendChannelStatusChange(event) {
	  if (sendChannel) {
		var state = sendChannel.readyState;
	  
		if (state === "open") {
			messageInputBox.disabled = false;
		  messageInputBox.focus();
		  sendButton.disabled = false;
		  disconnectButton.disabled = false;
		  connectButton.disabled = true;
		} else {
			messageInputBox.disabled = true;
		  	sendButton.disabled = true;
		  	connectButton.disabled = false;
		  	disconnectButton.disabled = true;
		}
	  }
	}
	
	// Called when the connection opens and the data
	// channel is ready to be connected to the remote.
	
	function receiveChannelCallback(event) {
	  receiveChannel = event.channel;
	  receiveChannel.onmessage = handleReceiveMessage;
	  receiveChannel.onopen = handleReceiveChannelStatusChange;
	  receiveChannel.onclose = handleReceiveChannelStatusChange;
	}
	
	// Handle onmessage events for the receiving channel.
	// These are the data messages sent by the sending channel.
	
	function handleReceiveMessage(event) {
	  var el = document.createElement("p");
	  var txtNode = document.createTextNode(event.data);
	  
	  el.appendChild(txtNode);
	  receiveBox.appendChild(el);
	}
	
	// Handle status changes on the receiver's channel.
	
	function handleReceiveChannelStatusChange(event) {
	  if (receiveChannel) {
		console.log("Receive channel's status has changed to " +
					receiveChannel.readyState);
	  }
	  
	  // Here you would do stuff that needs to be done
	  // when the channel's status changes.
	}
	
	// Close the connection, including data channels if they're open.
	// Also update the UI to reflect the disconnected status.
	
	function disconnectPeers() {
	
	  // Close the RTCDataChannels if they're open.
	  
	  sendChannel.close();
	  receiveChannel.close();
	  
	  // Close the RTCPeerConnections
	  
	  localConnection.close();
	  remoteConnection.close();
  
	  sendChannel = null;
	  receiveChannel = null;
	  localConnection = null;
	  remoteConnection = null;
	  
	  // Update user interface elements
	  
	  connectButton.disabled = false;
	  disconnectButton.disabled = true;
	  sendButton.disabled = true;
	  
	  messageInputBox.value = "";
	  messageInputBox.disabled = true;
	}
	
	// Set up an event listener which will run the startup
	// function once the page is done loading.
	
	window.addEventListener('load', startup, false);

	function sendLocalDescription(desc) {
		let p = {content: desc, id: '0000'};
		postData(`/connection/client`, p)
		.then(data => console.log(data)) // JSON-string from `response.json()` call
		.catch(error => console.error(error));
		
	}
	function connectController() {

	}
	function postData(url = ``, data = {}) {
		// Default options are marked with *
		  return fetch(url, {
			  method: "POST", // *GET, POST, PUT, DELETE, etc.
			  mode: "cors", // no-cors, cors, *same-origin
			  cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
			  credentials: "same-origin", // include, *same-origin, omit
			  headers: {
				  "Content-Type": "application/json; charset=utf-8",
				  // "Content-Type": "application/x-www-form-urlencoded",
			  },
			  redirect: "follow", // manual, *follow, error
			  referrer: "no-referrer", // no-referrer, *client
			  body: JSON.stringify(data), // body data type must match "Content-Type" header
		  })
		  .then(response => response.json()); // parses response to JSON
	}