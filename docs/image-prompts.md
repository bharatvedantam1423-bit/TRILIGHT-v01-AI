# Image prompts

Generate each image, export as **WebP** (or PNG and convert), and drop it into
the `public/img/` path shown. Rebuild; the site picks it up and
replaces the current picture. No code changes.

## Shared style (append to every prompt)

> Photorealistic editorial photo, Indian engineering students' hardware lab.
> Dark, moody scene: deep navy and charcoal surroundings, one soft cool key
> light from the upper left, a subtle teal (#00B6B4) rim/accent glow on the
> hardware. Clean, uncluttered composition with the subject centred and room
> around it. Shallow depth of field, 35mm look, high detail, crisp focus on
> the hardware. No text, no logos, no watermarks, no UI overlays. 4:3, 1600×1200.

Keep one object family across the ladder (a small agricultural field-sensor
node) so the eight images read as one product growing up.

## The ladder (`public/img/ladder/<id>.webp`, 4:3)

| File | Prompt |
|---|---|
| `explorer.webp` | An open notebook on a dark workbench showing hand-drawn circuit sketches and a simple sense-decide-act flow diagram in pencil, beside a starter kit: an LED, resistors, a jumper-wire bundle, an ultrasonic sensor module and a small microcontroller board. Learning, first steps. |
| `trl12.webp` | Top-down view of a team's idea session: sticky notes, a pencil concept sketch of a small soil-sensor device on graph paper with arrows and labels, a field photo printout of dry farmland, a laptop edge. Ideation and research. |
| `trl3.webp` | A laptop screen in a dark lab showing a 3D CAD model of a small sensor enclosure with an exploded view and a colour stress/thermal simulation map; a 3D mouse beside it. Simulation, before any hardware. |
| `trl4.webp` | Close-up of a breadboard prototype: microcontroller, soil-moisture probe, small OLED, jumper wires and a glowing LED, multimeter probes touching the circuit. Works on the bench. |
| `trl5.webp` | A hand-soldered perfboard (Zero PCB) circuit mounted inside an open grey plastic enclosure with its lid beside it, cable gland and soil probe attached, resting on soil at a farm edge at dusk. First real-world test. |
| `trl6.webp` | A clean custom green PCB on standoffs inside a matte enclosure, neatly routed cable, label on the case; a second identical unit closed beside it. Golden sample. |
| `trl7.webp` | Exploded view of the finished device floating in a row: top cover, gasket, battery, main PCB, sensor, base, all aligned and evenly spaced against a dark background. Built to certification standards. |
| `trl8.webp` | Several identical finished sensor units in a neat row on an assembly bench, one being tested with a probe, packed boxes behind them. Qualified, repeatable, ready to ship. |

## Fundamentals cards (`public/img/loop/<id>.webp`, 5:4, 1500×1200)

| File | Prompt |
|---|---|
| `sense.webp` | Macro of a soil-moisture and temperature sensor probe pushed into dark soil, its cable leading to a small board; droplets on the probe. Hardware reading the world. |
| `decide.webp` | Macro of a microcontroller board with a lit status LED, its chip in sharp focus, a faint teal glow of data traces across the PCB. The decision being made. |
| `act.webp` | A small irrigation solenoid valve opening with a burst of water, wired to a relay board, motion frozen. Something real happens. |

## Door photos (`public/img/doors/standard.webp`, `fasttrack.webp`, 16:9)

All images above are supplied (October 2026); originals in `assets/originals/`.
