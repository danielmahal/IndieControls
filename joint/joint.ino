#include "SoftwareSerial.h"

#define rxPin 3
#define txPin 4
#define pot A1

SoftwareSerial serial(rxPin, txPin);

int prevPot = 0;

int tick = 0;
int interval = 100;

char selfString[7] = {'0', ':', '1', '0', '2', '4', '\n'};
boolean sendSelf = true;
int selfIndex = 0;

char inputTemp[7];
char inputTempIndex = 0;
char input[7];
char inputIndex = 0;
char inputReady = false;

void setup() {
  serial.begin(9600);
  pinMode(pot, INPUT);
}

void loop() {
  tick++;
  
  if(serial.available() && !inputReady) {
    char in = (char) serial.read();
    
    if(inputTempIndex == -1) {
      if(in == '\n') {
        inputTempIndex = 0;
      }
    } else {
      if(inputTempIndex < 7) {
        inputTemp[inputTempIndex] = in;
        inputTempIndex++;
      }
      
      if(in == '\n') {
        for(int i = 0; i < 7; i++) {
          input[i] = inputTemp[i];
          inputTemp[i] = '\0';
        }
        
        inputReady = true;
        inputTempIndex = 0;
      }
    }
  }
  
  if(tick >= interval) {
    int potValue = analogRead(pot);
    boolean change = false;
    
    if(abs(potValue - prevPot) > 2) {
      prevPot = potValue;
      change = true;
    }
    
    if(sendSelf && change) {
      if(selfIndex == 0) {
        char value[4];
        itoa(potValue, value, 10);
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
      char currentChar = input[inputIndex];
      
      if(inputIndex < 7) {
//        if(inputIndex == 0) {
//          serial.write(currentChar + 1);
//        } else if(currentChar != '\0') {
//          serial.write(currentChar);
//        }

        if(inputIndex == 0) {
          serial.write(currentChar + 1);
        } else if(currentChar != '\0') {
          serial.write(currentChar);
        }
        
        inputIndex++;
      } else {
        for(int i = 0; i < 7; i++) {
          input[i] = '\0';
        }
        
        inputIndex = 0;
        sendSelf = true;
        inputReady = false;
        inputTempIndex = -1;
      }
      
//      if(inputIndex == 0) {
//        serial.write(currentChar + 1);
//      } else {
//        serial.write(currentChar);
//      }
//      
//      inputIndex++;
//      
//      if(inputIndex == 7) {
//        inputIndex = 0;
//        inputReady = false;
//        sendSelf = true;
//      }
//      sendSelf = true;
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
