---
title: Propeller Graduation Cap
date: 2018-06-17 00:59:00
tags:
- project
- electronics
---

For this year's graduation, I decided to decorate my cap with a little more than a sticker.

{% include figure image_path="graduation_cap.jpg" %}

## Motor

The first step into planning was deciding what motor to use. I wanted the electronics to be as simple as possible.
- Cheap DC motors (that were available) were difficult to mount onto the cap
- I didn't want a brushless quadcopter motor chopping off fingers
- Stepper motors were too heavy and needed an extra driver board

I ended up removing the blades on a [PC cooling fan](http://a.co/gUrWKEc). Though these fans were based on brushless motors, they are low power and have a controller built into them. At 4 watts, they're powerful enough to carry a quadcopter propeller on them.

## Propeller

I chose 9" propellers so that they would fit just inside the 9.25" x 9.25" cap. Both the original blades and the propeller blades CAN CUT YOU when running at full speed. Sanding down the edges will let you stick your finger in without any bleeding.

{% include figure image_path="graduation_cap_print.jpg" caption="One of the legs on this mount didn't print nicely." %}

To stick the large propeller on the now-bladeless fan, I printed a piece and superglued everything together.

## Electronics

{% include figure image_path="graduation_cap_boards.jpg" caption="Receiver and transmitter." %}

I tried to use the cheapest electronics possible. The unofficial Arduino Nanos are [$4 each](http://a.co/gdNyoho) (in bulk). The 433 MHz ASK radio transmitter / receiver pairs are less than [$1 each](http://a.co/gLzJF7L). The remaining perfboards, switches, transistor ([BC517](https://www.onsemi.com/pub/Collateral/BC517-D.PDF)) and wire are less than $1 combined.

The idea is pressing the switch on the controller / transmitter will drive the transistor on the hat / receiver. The transistor does get a little hot to the touch, so I put a heatsink just in case.

The antenna is a quarter wavelength wire (~17.3 cm), which significantly improve range. I didn't need any more than that since it would only need to reach from my hand to my head.

{% include figure image_path="graduation_cap_diagrams.png" caption="Fritzing diagram of the receiver and transmitter." %}

## Software

ASK RF transmitters and receivers are difficult to work with on their own. The [RadioHead library](http://www.airspayce.com/mikem/arduino/RadioHead/) implements a simple protocol for sending bits. This makes the software exteremely straightforward.

### Cap / Receiver Side
{% highlight C++ %}
#include <RH_ASK.h>

RH_ASK driver(2000, 4, 5);

void setup() {
  Serial.begin(9600);
  if (!driver.init()) {
    Serial.println("RH driver failed to initialize");
  }
  // NPN Transistor
  pinMode(2, OUTPUT);
}

uint8_t buffer[RH_ASK_MAX_MESSAGE_LEN];
uint8_t buffer_len = sizeof(buffer);
long last_time = 0;
void loop() {
  if (millis() - last_time > 1000) {
    digitalWrite(2, LOW);
  }
  if (driver.recv(buffer, &buffer_len)) {
    if (buffer[0] == 'O' && buffer[1] == 'N') {
      Serial.println("RECV");
      digitalWrite(2, HIGH);
      last_time = millis();
    }
  }
  delay(20);
}
{% endhighlight %}

### Controller / Transmitter Side
{% highlight C++ %}
#include <RH_ASK.h>

RH_ASK driver(2000, 5, 2);

void setup() {
  Serial.begin(9600);
  if (!driver.init()) {
    Serial.println("RH driver failed to initialize");
  }
}

void loop() {
  const char* msg = "on";
  if (!digitalRead(3)) {
    Serial.println("SEND");
    driver.send((uint8_t*) msg, strlen(msg));
    driver.waitPacketSent();
  }
  delay(20);
}
{% endhighlight %}

## Mounting

{% include figure image_path="graduation_cap_mount.jpg" %}

The cardboard inside the graduation cap was actually rather sturdy, so I went ahead and cut slits into the cardboard and mounted the fan with the provided screws and nuts. I went ahead and zip-tied the remaining board through the cardboard.
