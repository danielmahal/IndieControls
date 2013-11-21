#include "SoftwareSerial.h"

#define rxPin 3
#define txPin 4
#define pot A1

SoftwareSerial serial(rxPin, txPin);

int tick = 0;
int interval = 2000;

char selfString[7] = {'0', ':', '1', '0', '2', '4', '\n'};
boolean sendSelf = true;
int selfIndex = 0;

char input[200];
int inputWriteIndex = 0;
int inputReadIndex = 0;
int inputSendIndex = 0;
boolean inputReady = false;


void setup() {
  serial.begin(9600);
  pinMode(pot, INPUT);
}

void loop() {
  tick++;
  
  if(serial.available()) {
    char in = (char) serial.read();
    input[inputWriteIndex] = in;
    inputWriteIndex++;
    
    if(inputWriteIndex == 200) {
      inputWriteIndex = 0;
    }
    
    if(in == '\n') {
      inputReady = true;
    }
  }
  
  if(tick >= interval) {
    if(sendSelf) {
      if(selfIndex == 0) {
        char value[4];
        itoa(analogRead(pot), value, 10);
        selfString[2] = value[0];
        selfString[3] = value[1];
        selfString[4] = value[2];
        selfString[5] = value[3];
      }
      
      char currentChar = selfString[selfIndex];
      
      if(currentChar != '\0') {
        serial.write(currentChar);
      }
      
      selfIndex++;
      
      if(selfIndex == 7) {
        selfIndex = 0;
        sendSelf = false;
      }
    } else if(inputReady) {
      char currentChar = input[inputReadIndex];
      
      if(inputSendIndex == 0) {
        serial.write(currentChar + 1);
      } else {
        serial.write(currentChar);
      }
      
      inputSendIndex++;
      inputReadIndex++;
      
      if(currentChar == '\n') {
        inputSendIndex = 0;
        inputReady = false;
        sendSelf = true;
      }
      
      if(inputReadIndex == 200) {
        inputReadIndex = 0;
      }
    } else {
      sendSelf = true;
    }
    
    tick = 0;
  }
  
    
//    serial.write();
//    char in = (char) serial.read();
//    
//    if(in == '\n') {
//    
//    }
//    serial.write('1');
//    delay(10);
//    serial.write(':');
//    delay(10);
//    serial.write('1');
//    delay(10);
//    serial.write('5');
//    delay(10);
//    serial.write('0');
//    delay(10);
//    serial.write('\n');
//    delay(10);
//  }
    
//    
//    if(!startRead) {
//      if(in == '\n') {
//        startRead = true;
//      }
//    } else if(in == ':') {
//      inputToggle = true;
//    } else if(in == '\n') {
//      inputToggle = false;
//      
//      serial.write(id+1);
//      delay(10);
//      serial.write(":");
//      delay(10);
//      for(int i = 0; i < sizeof(valueString); i++) {
//        if(valueString[i] != '\0') {
//          serial.write(valueString[i]);
//          delay(10);
//        }
//      }
//      serial.write("\n");
//      delay(10);
//      
//      valueStringI = 0;
//      valueString[0] = '\0';
//      valueString[1] = '\0';
//      valueString[2] = '\0';
//      valueString[3] = '\0';
//    } else if(inputToggle) {
//      id = in - '0';
//    } else {
//      valueString[valueStringI] = in;
//      valueStringI++;
//    }
//  }
  
//  itoa(analogRead(pot), value, 10);
//  
//  serial.write('0');
//  delay(10);
//  serial.write(':');
//  delay(10);
//  for(int i = 0; i < sizeof(value); i++) {
//    if(value[i] != '\0') {
//      serial.write(value[i]);
//      delay(10);
//    }
//  }
//  serial.write('\n');
//  delay(10);
  
  
//  delay(120);
//  serial.write(analogRead(pot));
//  delay(120);
//  serial.write(",");
//  delay(80);
//  
//  for(int i = 0; i < sizeof(values) / sizeof(int); i++) {
//    if(values[i] > -1) {
//      serial.write(i+1);
//      serial.write(":");
//      serial.write(values[i]);
//      serial.write(","); 
//      delay(10);
//    }
//  }
}
