---
title: Prusa PSU Fix
date: 2018-09-22 00:00:00
tags:
- electronics
---

The PSU that came with my Prusa MK3 kit had a strange rattling sound as I picked it up. Sure enough, the large capacitor was loose inside.

{% include figure image_path="prusa_psu_capacitor1.jpg" %}

{% include figure image_path="prusa_psu_capacitor2.jpg" %}

Sure enough after taking out the PCB, the leads seem to have broken free from the solder. Since this was "QC Checked", this may have happened in during shipment. Prusa support was very nice, though I didn't want to wait for a replacement.

{% include figure image_path="prusa_psu_capacitor3.jpg" %}

After a bit of resoldering it's good as new!

{% include figure image_path="prusa_psu_fixed.jpg" %}

{% include figure image_path="prusa_psu_working.jpg" %}
