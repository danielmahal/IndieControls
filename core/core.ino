String inputString = "";
boolean stringComplete = false;

void setup() {
  Serial.begin(300);
  inputString.reserve(200);
}

void loop() {
  if (stringComplete) {
    Serial.println(inputString); 
    inputString = "";
    stringComplete = false;
  }
}

void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    
    if (inChar == ',') {
      stringComplete = true;
    } else {
      inputString += inChar;
    }
  }
}
