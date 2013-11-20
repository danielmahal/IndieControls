int in = A0;

void setup() {
  Serial.begin(9600);
  pinMode(in, INPUT);
}

void loop() {
  int pulseTimeout = 256 * 60 * 2;
  int value = floor(float(pulseIn(in, HIGH, pulseTimeout) / 256.0 / 60) * 255);
  int i = value / 50;
  Serial.println(i);
}
