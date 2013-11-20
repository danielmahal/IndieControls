// Made to test with arduino in chain

void setup() {
  pinMode(9, OUTPUT);
  pinMode(A0, INPUT);
}

void loop() {
  analogWrite(9, (analogRead(A0) / 1024.0) * 255.0);
}
