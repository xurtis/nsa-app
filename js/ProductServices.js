var productServices = angular.module('ProductServices', ['ngResource'])

function CipherStoreFactory($http) {
    this.changeable = false;
    this.cipherObj = null;
    this.cipherLib = null;
    this.loadCallback = null;

    // Load the cipher library
    $http.get("quotes.json").then(this.getConfigure(), this.getNoConfigure());
}

// Load words using a callback
CipherStoreFactory.prototype.loadWords = function (callback) {
    this.loadCallback = callback;
}

// Load words from the URL
CipherStoreFactory.prototype.loadURLWords = function() {
    var loaded = false;

    if (window.location.href.indexOf("?") >= 0) {
        var href = window.location.href;
        var obj = href.substring(href.indexOf("?") + 1);
        // Decode
        obj = atob(obj);
        // Objectify
        this.cipherObj = JSON.parse(obj); 
        this.changeable = false;

        loaded = true;
    }

    return loaded;
}

// Configure the cipher
CipherStoreFactory.prototype.getConfigure = function() {
    // store this
    var that = this;

    return function (libResponse) {
        that.cipherLib = libResponse.data;

        var urlWords = that.loadURLWords();
        // Check the url for an object
        if (!urlWords) {
            // Get random cipher from library
            that.cipherObj = that.__randomCipher();
            that.changeable = true;
        }
    
        // Check for callback
        if (that.loadCallback !== null) {
            that.loadCallback(that.getCipher(), that.changeable);
        }
    }
}

// Configure without AJAX
CipherStoreFactory.prototype.getNoConfigure = function() {
    // Store this
    var that = this;

    return function (libResponse) {
        that.loadURLWords();
    
        // Check for callback
        if (that.loadCallback !== null) {
            that.loadCallback(that.getCipher(), that.changeable);
        }
    }
}

// Select a random cipher from the library
CipherStoreFactory.prototype.__randomCipher = function () {
    var libLength = this.cipherLib.length;
    var select = Math.floor(Math.random() * libLength);

    return this.cipherLib[select];
}

// Select a new cipher
CipherStoreFactory.prototype.__changeCipher = function () {
    if (this.changeable) {
        this.cipherObj = this.__randomCipher();
    }
}
CipherStoreFactory.prototype.newCipher = function () {
    this.__changeCipher();
    return this.getCipher();
}
CipherStoreFactory.prototype.newCipherWords = function () {
    this.__changeCipher();
    return this.getCipherWords();
}

// Fetch the cipher from a CipherStore
CipherStoreFactory.prototype.getCipher = function() {
    var cipherString = null;
    if (this.cipherObj !== null) {
        cipherString = this.cipherObj.cipher.toString();
    }
    return cipherString;
}

// Fetch the cipher as words
CipherStoreFactory.prototype.getCipherWords = function() {
    var cipherString = null;
    if (this.cipherObj !== null) {
        cipherString = this.cipherObj.cipher.toString().split(" ");
    }
    return cipherString;
}

// Fetch the identifer of if the cipher can be changed
CipherStoreFactory.prototype.isChangeable = function() {
    return this.changeable;
}

// Verify message with a sha224
CipherStoreFactory.prototype.verify = function(message) {
    var verified = false;
    if (this.cipherObj !== null) {
        var shaObj = new jsSHA("SHA-224", "TEXT");
        shaObj.update(message + this.cipherObj.checksum.salt);

        verified = (shaObj.getHash("HEX") == this.cipherObj.checksum.hash);
    }

    return verified;
}

productServices.factory("CipherStore", ["$http", function ($http) {
    return new CipherStoreFactory($http);
}])
