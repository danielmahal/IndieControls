int in = A0;
int led = 11;

void setup() {
  Serial.begin(9600);
  pinMode(in, INPUT);
  pinMode(led, OUTPUT);
}

void loop() {
  int pulseTimeout = 256 * 60 * 2;
  double value = pulseIn(in, LOW, pulseTimeout) / 256.0 / 60.0;
  int pot = int(value * 1024);
  
  analogWrite(led, map(pot, 0, 1024, 0, 255));
  Serial.println(value);
}
