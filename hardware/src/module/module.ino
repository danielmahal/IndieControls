#include <SoftwareSerial.h>

#define rxPin 4
#define txPin 3
#define potPin A1

int moduleType = 0;

int prevValue;
int value;

int sendInterval = 1000;
int pingInterval = 1000000;
int sendTimer;
int pingTimer;

SoftwareSerial mySerial(rxPin, txPin);

int current;

void setup() {
  pinMode(potPin, INPUT);
  mySerial.begin(9600);
}

void loop() {
  sendTimer++;
  if(sendTimer == sendInterval) sendTimer = 0;

  pingTimer++;
  if(pingTimer == pingInterval) pingTimer = 0;

  if(mySerial.available()) {
    byte in = mySerial.read();

    if(in < 40) {
      current = in + 1;
    } else {
      mySerial.write(current);
      mySerial.write(in);
    }
  }

  if(pingTimer == 0) {
    sendPing();
  } else if(sendTimer == 0) {
    sendValue();
  }
}

void sendValue() {
  value = 50 + ceil(float(analogRead(potPin) / 1024.0) * 200.0);

  if(abs(value - prevValue) > 2) {
    prevValue = value;
    mySerial.write(1);
    mySerial.write(value);
  }
}

void sendPing() {
  mySerial.write(1);
  mySerial.write(40 + moduleType);
}
