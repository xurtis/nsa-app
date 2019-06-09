#!/usr/bin/env python

from random import shuffle
import json
from os import urandom
from string import maketrans
from hashlib import sha224

ALPHABET = [chr(a) for a in xrange(ord("A"), ord("A") + 26)]
SALT_BYTES = 8

# Function to create a random character mapping
def genSubMap(alpha = ALPHABET):
    mapTo = [x for x in alpha]

    shuffle(mapTo)

    return maketrans(''.join(alpha), ''.join(mapTo))

# Get a salt
def genSalt():
    saltBytes = urandom(SALT_BYTES)
    saltHex = ''.join(["{0:02x}".format(ord(b)) for b in saltBytes])
    return saltHex

# Create the checksum
def genChecksum(message):
    salt = genSalt()
    hashSum = sha224(message + salt).hexdigest()
    return {"salt" : salt, "hash": hashSum}

# Create an ciphertext along with a checksum
def encipher(message):
    message = message.encode("utf-8").upper()
    # Get a substitution map
    subMap = genSubMap();

    # Get the hash for the valid message
    hashSum = genChecksum(message);

    cipher = message.translate(subMap);

    cipherSet = {
        "cipher" : cipher,
        "checksum" : hashSum
    }

    return cipherSet

# Load he current set of quotes
quotes = json.load(file("oldQuotes.json"))["quotes"]

quoteLibrary = []

for quote in quotes:
    quoteLibrary.append(encipher(quote))

# Store the quotes
json.dump(quoteLibrary, file("quotes.json", 'w'), indent=2)
