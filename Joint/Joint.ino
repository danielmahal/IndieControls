int pot = A1;
int out = 0;

void setup() {
  pinMode(pot, INPUT);
  pinMode(out, OUTPUT);
}

void loop() {
  int val = map(analogRead(pot), 0, 1023, 1, 255);
  analogWrite(out, val);
}

