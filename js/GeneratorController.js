app.controller("GeneratorController", function ($scope) {
    
    // Set up the model
    $scope.message = "Your Message"; // Input message to encipher
    $scope.mapString = "ABCDEFGHIJKLMNOP";
    $scope.cipher = "???";
    $scope.salt = "12345678";
    $scope.checksum = "nope";
    $scope.urlBase = "http://";
    $scope.fullLink = "http://lolno";

    // Internal mapping
    $scope.map = {}


    // Generate the base URL
    $scope.getURLBase = function () {
        // Get the URL path
        var path = window.location.pathname.split("/");
        // Set the index page to last part of path
        path.pop();
        path.push("index.html");
    
        // Create the path
        $scope.urlBase = window.location.protocol + "//" + window.location.host + path.join("/");

        // Update the link
        $scope.update();
    }

    // Generate a map
    $scope.genMap = function() {
        var alpha = [];
        $scope.mapString = [];
        var alphaStart = "A".charCodeAt(0);
        for (i = alphaStart; i < (alphaStart + 26); i++) {
            var c = String.fromCharCode(i);
            alpha.push(c);
            $scope.mapString.push(c);
        }

        // Copy alphastring
        shuffle($scope.mapString);

        // Generate the map dictionsry
        for (i = 0; i < alpha.length; i++) {
            $scope.map[alpha[i]] = $scope.mapString[i];
        }

        // Condense map string
        $scope.mapString = $scope.mapString.join("");

        // Update the link
        $scope.update();
    }

    // Generate a hash salt
    $scope.genSalt = function () {
        $scope.salt = hrandom(8);

        // Update the link
        $scope.update();
    }

    // Update the link
    $scope.update = function () {
        // Enforce Uppercase
        $scope.message = $scope.message.toUpperCase();

        // Get the cipher of the message
        if (($scope.message.length > 0) && ($scope.map !== null)) {
            $scope.cipher = encipher($scope.message, $scope.map);
        }
        
        // Generate the checksum
        if (($scope.message.length > 0) && ($scope.salt.length > 0)) {
            var sha = new jsSHA("SHA-224", "TEXT");
            sha.update($scope.message + $scope.salt);
            $scope.checksum = sha.getHash("HEX");
        }

        // Generate the javascript object
        var jsObj = {
            "checksum" : {
                "hash" : $scope.checksum,
                "salt" : $scope.salt
            },
            "cipher" : $scope.cipher
        };

        // Generate the encoded data
        var encoded = btoa(JSON.stringify(jsObj));

        // Create the link
        $scope.fullLink = $scope.urlBase + "?" + encoded;
    }

    // Encipher the message
    function encipher(message, map) {
        var cipher = "";
        var letter = "";

        for (l in message) {
            letter = message[l];

            if (letter in map) {
                cipher += map[letter];
            } else {
                cipher += letter;
            }
        }

        return cipher;
    }


    // Generate random bytes
    function hrandom(nBytes) {
        var byteSize = Math.pow(2, 8);
        var bytes = "";
        var b = 0;
        var bString = "";

        for (var i = 0; i < nBytes; i++) {
            b = (Math.random() * byteSize);
            b %= byteSize;
            b = Math.floor(b);
            bString = b.toString(16);
            
            // Pad string
            while (bString.length < 2) {
                bString = "0" + bString;
            }

            bytes += bString;
        }

        return bytes;
    }

	function shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}

    // Initialise the model
    $scope.getURLBase();
    $scope.genMap();
    $scope.genSalt();
});
