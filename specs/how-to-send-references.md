# How to send a reference

Written from what has actually worked on this build, and what has not.

---

## The short version

For one section, send:

1. **A screen recording** of the reference doing the thing (5–15s is plenty)
2. **Two or three stills** at the moments that matter
3. **Three lines of text**: what to copy, what to ignore, and which wins if
   the video and the words disagree

That third line is the one people skip, and it is the one that costs a
rebuild when it is missing.

---

## What each input is good for

| Input | Use it for | Notes |
|---|---|---|
| Screen recording (.mp4) | Anything that moves | Best input. H.264 decodes fine. |
| Stills | Layout, type, spacing, colour | 2–3 beats 1. Grab the key moments. |
| Written transition prompt | Timing, easing, stagger, duration | The most precise input available. |
| A live URL | Naming the reference | **Weakest.** Most sites are blocked by this environment's egress proxy, so a link on its own usually cannot be opened. Always pair it with a recording or stills. |
| "Make it feel premium" | Nothing | Produces a guess. Every time. |

---

## A template to fill in

```
SECTION: <which section>

REFERENCE: <site name> — <attach recording + stills>

WHAT TO COPY:
- <the structure / the motion / the type / the spacing — be specific>

WHAT TO IGNORE:
- <colour, copy, the bits that are theirs and not ours>

MOTION:
- Trigger:   <on scroll into view | scrubbed to scroll | on click | on hover>
- Duration:  <ms, or "tied to scroll">
- Easing:    <ease-out | spring/overshoot | linear for continuous>
- Stagger:   <ms between elements>
- Distance:  <how far anything travels>

IF THE VIDEO AND THIS TEXT DISAGREE: <video wins | text wins>
```

---

## Why the last line matters

It has come up twice on this build, and both times the work was done twice:

- **Problem** — the capture showed the background media shrinking into the
  card's portrait slot. The written spec said crossfade. Built the shrink,
  then rebuilt it as a crossfade.
- **FAQ** — the capture showed the letters scrolling away. The written spec
  said they shrink into the corner. Built the shrink, kept it.

Neither was wrong to want. They just needed one line saying which to follow.

---

## Two details worth naming every time

**Trigger.** "Fires once when it comes into view" and "tied to scroll
position" look similar in a recording and behave completely differently.
Scrubbed motion runs backwards when the visitor scrolls up; a one-shot does
not.

**Easing.** This is usually the whole difference between a reference feeling
expensive and a build feeling flat. The testimonial cards were the example:
the structure was already right, and swapping `power2.out` for an elastic
settle was the entire fix.
