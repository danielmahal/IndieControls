int out = 0;

int i = 1;

void setup() {
  pinMode(out, OUTPUT);
}

void loop() {
  i++;
  
  if(i > 5) {
    i = 1;
  }
  
  analogWrite(out, i * 50);
}
