
 
 
var m_start, m_hihat, m_snare, m_tom1, m_tom2, m_floor, m_crash, m_ride;

function initSounds() {
	
	if (device.platform == "Android") {		
		m_start = new Media("/android_asset/www/sounds/start1.mp3");
		m_hihat = new Media("/android_asset/www/sounds/hihat.mp3");
		m_snare = new Media("/android_asset/www/sounds/snare.wav");
		m_tom1 = new Media("/android_asset/www/sounds/tom1.wav");
		m_tom2 = new Media("/android_asset/www/sounds/tom2.wav");
		m_floor = new Media("/android_asset/www/sounds/floor.wav");
		m_crash = new Media("/android_asset/www/sounds/crash.mp3");
		m_ride = new Media("/android_asset/www/sounds/ride.mp3");
	} else {		
		m_start = new Media("/sounds/start1.mp3");
		m_hihat = new Media("/sounds/hihat.mp3");
		m_snare = new Media("/sounds/snare.wav");
		m_tom1 = new Media("/sounds/tom1.wav");
		m_tom2 = new Media("/sounds/tom2.wav");
		m_floor = new Media("/sounds/floor.wav");
		m_crash = new Media("/sounds/crash.mp3");
		m_ride = new Media("/sounds/ride.mp3");
	}
}


function play() {
	piece = this.id;
	if (piece == "hihat") {
		m_hihat.stop();
		m_hihat.play();
	}	else if (piece == "snare") {
		m_snare.stop();
		m_snare.play();
	}	else if (piece == "crash") {
		m_crash.stop();
		m_crash.play();
	}	else if (piece == "tom1") {
		m_tom1.stop();
		m_tom1.play();
	}	else if (piece == "tom2") {
		m_tom2.stop();
		m_tom2.play();
	}	else if (piece == "floor") {
		m_floor.stop();
		m_floor.play();
	}	else if (piece == "ride") {
		m_ride.stop();
		m_ride.play();
	}
}
 

function hide_splash() {
	document.getElementById("splash").style.display = 'none';
	document.getElementById("drumset").style.display = 'block';
}
 
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
		
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
				initSounds();
				document.getElementById("hihat").addEventListener("click", play, false);
				document.getElementById("snare").addEventListener("click", play, false);
				document.getElementById("tom1").addEventListener("click", play, false);
				document.getElementById("tom2").addEventListener("click", play, false);
				document.getElementById("floor").addEventListener("click", play, false);
				document.getElementById("crash").addEventListener("click", play, false);
				document.getElementById("ride").addEventListener("click", play, false);
				m_start.play();
				window.setTimeout(hide_splash, 3000);
        app.receivedEvent('deviceready');
    },
		
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();