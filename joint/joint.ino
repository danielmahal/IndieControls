int in = 3;
int pot = 2;
int out = 0;
boolean inConnected = false;

int values[] = { 100, 0 };
int idOut = 0;
int connectionCounter = 0;
int pulseTimeout = 256 * 60 * 2;

void setup() {
  pinMode(in, INPUT);
  pinMode(out, OUTPUT);
}

void loop() {
  if(inConnected) {
    connectionCounter = 0;
    
    int raw = getPulseIn();
    
    if(raw == 0) {
      inConnected = false;
    } else {
      values[1] = raw;
    }
  } else {
    connectionCounter++;
    
    if(connectionCounter == 100) {
      connectionCounter = 0;
      int check = pulseIn(in, HIGH, pulseTimeout);
      if(check > 0)
        inConnected = true;
    }
  }
  
//  int compound = ;
//  int idIn = floor(compound / 50);
//  int value = (float(compound - (idIn * 50)) / 50.0) * 255.0;
//  values[1] = getPulseIn();
  
//  values[0] = (float(analogRead(pot)) / 1024.0) * 255;
  
  // Out
  idOut++;
  if(idOut >= 2) idOut = 0;
  
  int valueOut = (float(values[idOut]) / 255.0) * 50;
  valueOut += (idOut) * 50;
  
  analogWrite(out, valueOut);
//  analogWrite(out, values[0]);

  

//  int valueOut = (float(getPulseIn()) / 255.0) * 50;
//  valueOut += 0 * 50;
//  analogWrite(out, valueOut);
}

int getPulseIn() {
  return pulseIn(in, HIGH, pulseTimeout) / 1.05;
}
