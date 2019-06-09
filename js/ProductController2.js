app.controller('ProductController', function($scope, $resource, $location, $window, $cookies, $cookieStore, $uibModal, $log, $sce, CipherStore){

    // Initialise the scope
    
    // Store the enciphered message [split into words]
	$scope.message = "HELLO THIS IS A TEST CIPHER. IT IS JUST SOME EXAMPLE TEXT TO TEST THE FUNCTIONALITY OF THIS SITE";
    $scope.cipher = "OCKKI TOZX ZX Y TCXT NZWOCH. ZT ZX LPXT XIVC CBYVWKC TCBT TI TCXT TOC QPDNTZIDYKZTE IQ TOZX XZTC";
    $scope.changeable = true;
    $scope.outerMap = genCipherMap();
    $scope.outerReverse = reverseMap($scope.outerMap);
    $scope.cipher = encipher($scope.cipher, $scope.outerMap);

    // Load the Cipher Store Cipher
    var loadWords = CipherStore.getCipher();
    if (loadWords !== null) {
        $scope.cipher = loadWords;
    }

    // Create a callback to set the cipher
    $scope.setCipherWords = function (cipher, changeable) {
        // Generate a random second layer
        $scope.outerMap = genCipherMap();
        $scope.outerReverse = reverseMap($scope.outerMap);
        $scope.cipher = encipher(cipher, $scope.outerMap, true);
        $scope.changeCipher = changeable;
        $scope.genCrack();
        $scope.genLines();
    }
    CipherStore.loadWords($scope.setCipherWords);

    // Load whether cipher can be changed
    $scope.changeCipher = CipherStore.isChangeable();

    // Generate a crack map
    $scope.genCrack = function () {
        $scope.crack = {};
        $scope.used = {};
        $scope.letters = [[], []];
        alphaStart = "A".charCodeAt(0); // Char code for A
        for (var c = alphaStart; c < alphaStart + 26; c++) {
            // Initialise all chars to '-'
            var charStr = String.fromCharCode(c);
            $scope.crack[charStr] = "";
            if (c - alphaStart  < 13) {
                $scope.letters[0].push(charStr);
            } else {
                $scope.letters[1].push(charStr);
            }
    
            // Check if letter is used
            if ($scope.cipher.indexOf(charStr) >= 0) {
                $scope.used[charStr] = true;
            } else {
                $scope.used[charStr] = false;
            }
        }
    }

    // Generate a cipher mapping
    function genCipherMap() {
        var alpha = [];
        var mapString = [];
        var map = {};
        var alphaStart = "A".charCodeAt(0);

        for (var i = alphaStart; i < (alphaStart + 26); i++) {
            var c = String.fromCharCode(i);
            alpha.push(c);
            mapString.push(c);
        }

        // Copy alphastring
        shuffle(mapString);

        // Generate the map dictionsry
        for (i = 0; i < alpha.length; i++) {
            map[alpha[i]] = mapString[i];
        }

        return map;
    }

    // Encipher the message
    function encipher(message, map, noDash) {
        if (noDash === undefined) {
            noDash = false;
        }
        var cipher = "";
        var letter = "";
        var cipherLetter = "";

        for (l in message) {
            letter = message[l];

            if (letter in map) {
                cipherLetter = map[letter];
                if ((cipherLetter == "") && !noDash) {
                    cipherLetter = "-";
                }
                cipher += cipherLetter;
            } else {
                cipher += letter;
            }
        }

        return cipher;
    }
    $scope.encipher = encipher;

    // Reverse a cipher map
    function reverseMap(map) {
        var revMap = {};

        for (var k in map) {
            revMap[map[k]] = k;
        }

        return revMap;
    }

    // Select a new cipher
    $scope.newCipher = function () {
        if ($scope.changeCipher) {
            $scope.setCipherWords(CipherStore.newCipher(), $scope.changeCipher);
        }
        // Clear the screen
        this.clear_screen();
    }

    // Set letter to show as bold
    $scope.showBold = null

    // Set up all of the words to display
    $scope.lines = []
    $scope.decipher = "";
    $scope.genLines = function() {
        // Maximum words per line is 13
        var MAX_WORDS = 8;

        // Clear the lines
        $scope.lines = [];

        // Verify uppercase
        for (l in $scope.crack) {
            $scope.crack[l] = $scope.crack[l].toUpperCase();

            var inLetters = false;
            for (r in $scope.letters) {
                var row = $scope.letters[r];
                for (vl in row) {
                    if ($scope.crack[l] == row[vl]) {
                        inLetters = true;
                    }
                }
            }

            if (!inLetters) {
                $scope.crack[l] = "";
            }
        }

        // Generate a set of lines for the crack and the cipher
        var wordCount = 1;
        var allWords = $scope.cipher.split(" ");
        var singleLine = [];
        for (var w in allWords) {

            var word = allWords[w];

            var wordSet = [];
            
            for (var l in word) {
                wordSet.push(word[l]);
            }

            singleLine.push(wordSet);

            if ((wordCount % MAX_WORDS) == 0) {
                $scope.lines.push(singleLine);

                // Clear the line holders
                singleLine = [];
            }

            wordCount++;
        }
                
        // Push remaining words to a new line
        $scope.lines.push(singleLine);

        // Decipher the text
        $scope.decipher = encipher($scope.cipher, $scope.crack);

        // Verify the crack
        $scope.verify();
    }

    // Embolden a letter
    $scope.bold = function(letter) {
        $scope.showBold = letter;
        $scope.genLines();
    }

    // Log a letter
    $scope.logLetter = function(letter) {
        console.log(letter);
        console.log(this);
    }

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

    // Enable jumping by checking cookies
    if ($cookies.get("enableJump")) {
        $scope.enableJump = $cookies.getObject("enableJump");
    } else {
        $scope.enableJump = false;
    }

    // Toggle the jumping ability
    $scope.toggleJump = function() {
        if ($scope.enableJump) {
            $scope.enableJump = false;
        } else {
            $scope.enableJump = true;
        }
        // Store cookie
        $cookies.putObject("enableJump", $scope.enableJump);
    }

    // Function to jump straight to a character
    $scope.shiftJump = function (e) {
        var alphaStart = "A".charCodeAt(0);

        if ($scope.enableJump) {
            if ((e.charCode >= alphaStart) && (e.charCode < alphaStart + 26)) {
                // Select appropriate input
                var letter = String.fromCharCode(e.charCode);
                $scope.letterSelect(letter);
                
                // Prevent further action
                e.preventDefault()
            }
        }
    }

    // Select a given letter
    $scope.letterSelect = function (letter) {
        var inLetters = false;
        for (r in $scope.letters) {
            row = $scope.letters[r];
            for (l in row) {
                if (letter == row[l]) {
                    inLetters = true;
                }
            }
        }

        if (inLetters) {
            // Set input to letter
            $("." + letter + "-input").select();
            // Bold selected letter
            $scope.bold(letter);
        }
    }

	$scope.clear_screen = function clear(){
		for (var key in $scope.crack){
			$scope.crack[key] = '';
		}
        $scope.genLines();
	}

    // Check the validity of a message
    $scope.verified = false;
    $scope.verify = function () {
        $scope.verified = CipherStore.verify($scope.decipher);
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

    // Generate the inital lines
    $scope.genCrack();
    $scope.genLines();
});






