int out = 0;

int i = 0;

void setup() {
  pinMode(out, OUTPUT);
}

void loop() {
  i++;
  
  if(i > 5) {
    i = 0;
  }
  
  analogWrite(out, i * 50);
}
