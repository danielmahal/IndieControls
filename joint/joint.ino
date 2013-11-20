int out = 0;

int values[] = { 22, 54, 83, 130 };
int i = 0;

void setup() {
  pinMode(out, OUTPUT);
}

void loop() {
  // Out
  i++;
  if(i > 3) i = 0;
  
  int value = (float(values[i]) / 255.0) * 50;
  int sendValue = ((i) * 50) + value;
  
  analogWrite(out, sendValue);
}
