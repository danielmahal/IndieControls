int in = A0;

void setup() {
  Serial.begin(9600);
  pinMode(in, INPUT);
}

void loop() {
  int pulseTimeout = 256 * 60 * 2;
  int raw = floor(float(pulseIn(in, HIGH, pulseTimeout) / 256.0 / 60) * 255);
  int i = floor(raw / 50);
  int value = raw;

  Serial.print(i);
  Serial.print(": ");
  Serial.print(value);
  Serial.println();
}
