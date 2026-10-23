# Image prompts

> The ladder photos keep the dark lab style below (they sit in dark frames).
> The Fundamentals photos use the light editorial style in their own section.

Generate each image, export as **WebP** (or PNG and convert), and drop it into
`public/img/` with the file name shown. Rebuild; the site picks it up and
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

## The ladder (`public/img/stage-<id>.webp`, 4:3)

| File | Prompt |
|---|---|
| `stage-explorer.webp` | An open notebook on a dark workbench showing hand-drawn circuit sketches and a simple sense-decide-act flow diagram in pencil, beside a starter kit: an LED, resistors, a jumper-wire bundle, an ultrasonic sensor module and a small microcontroller board. Learning, first steps. |
| `stage-trl12.webp` | Top-down view of a team's idea session: sticky notes, a pencil concept sketch of a small soil-sensor device on graph paper with arrows and labels, a field photo printout of dry farmland, a laptop edge. Ideation and research. |
| `stage-trl3.webp` | A laptop screen in a dark lab showing a 3D CAD model of a small sensor enclosure with an exploded view and a colour stress/thermal simulation map; a 3D mouse beside it. Simulation, before any hardware. |
| `stage-trl4.webp` | Close-up of a breadboard prototype: microcontroller, soil-moisture probe, small OLED, jumper wires and a glowing LED, multimeter probes touching the circuit. Works on the bench. |
| `stage-trl5.webp` | A hand-soldered perfboard (Zero PCB) circuit mounted inside an open grey plastic enclosure with its lid beside it, cable gland and soil probe attached, resting on soil at a farm edge at dusk. First real-world test. |
| `stage-trl6.webp` | A clean custom green PCB on standoffs inside a matte enclosure, neatly routed cable, label on the case; a second identical unit closed beside it. Golden sample. |
| `stage-trl7.webp` | Exploded view of the finished device floating in a row: top cover, gasket, battery, main PCB, sensor, base, all aligned and evenly spaced against a dark background. Built to certification standards. |
| `stage-trl8.webp` | Several identical finished sensor units in a neat row on an assembly bench, one being tested with a probe, packed boxes behind them. Qualified, repeatable, ready to ship. |

## Fundamentals cards: the smoke alarm (`public/img/loop-<id>.webp`, 1:1)

The three cards in "Fundamentals That Matters While You Build" follow one
worked example: a smoke alarm that **senses** smoke, **decides** whether it is
a real fire, and **acts** (sprinklers on, fire brigade called). Until a photo
is dropped in, each card shows its blueprint drawing.

### Style (append to all three prompts)

> Editorial documentary photograph, 35mm film look (soft Kodak Portra
> colour), natural daylight from a window, muted cool-neutral palette (off-white
> walls, grey concrete, pale wood) with one small touch of teal (#00B6B4) on
> the hardware. Gentle film grain, shallow depth of field, calm and real, not
> staged, nobody looking at the camera. Subject in the lower two-thirds of the
> frame. Keep the top-left corner plain and slightly darker (a white title
> sits there) and the top-right corner empty (the card's folder tab cuts it
> away). No text, no logos, no watermarks, no UI. Square 1:1, at least
> 1600×1600 px.

| File | Prompt |
|---|---|
| `loop-sense.webp` | A white ceiling-mounted smoke detector on a plain ceiling in an Indian college hostel corridor, seen from slightly below. A thin wisp of grey smoke curls up into its vents and its small red indicator light glows. Hardware reading the world. |
| `loop-decide.webp` | Macro of the same smoke detector opened up: its round circuit board with a small microcontroller chip in sharp focus, a tiny teal status LED lit, the optical smoke chamber beside it and a faint haze of smoke drifting across. The moment the device decides: burnt toast, or a real fire? |
| `loop-act.webp` | A ceiling fire sprinkler head bursting into a wide spray of water, droplets frozen mid-air, in the same corridor in soft daylight. In the lower corner, out of focus, a phone screen glows with an outgoing call (no readable text). The system acting: water on, help called. |

Export as WebP (quality ~80, under ~300 KB), drop into `public/img/`, rebuild.

## Door photos (`public/img/door-standard.webp`, `door-fasttrack.webp`, 16:9)

Already supplied. Replace the same way.
