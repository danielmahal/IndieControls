String inputString = "";
boolean stringComplete = false;

void setup() {
  Serial.begin(9600);
  inputString.reserve(200);
}

void loop() {
  if (Serial.available()) {
    Serial.print((char) Serial.read());
  }
//  if (stringComplete) {
//    Serial.println(inputString); 
//    inputString = "";
//    stringComplete = false;
//  }
}

void serialEvent() {
//  while (Serial.available()) {
//    char inChar = (char)Serial.read();
//    
//    if (inChar == ',') {
//      stringComplete = true;
//    } else {
//      inputString += inChar;
//    }
//  }
}
