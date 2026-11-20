# makefun-gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ccxiaoba555/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ccxiaoba555/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: every official name, description and grade, a guide in our own words for each trophy, a roadmap to the platinum, missable-trophy warnings, and a checklist that saves your progress in the browser. No account, no network, nothing leaves your machine.

The trophy list is the official PS5 list as published by Exophase and PSNProfiles (1 platinum, 2 gold, 6 silver, 46 bronze, 28 of them hidden on PlayStation until earned). Each guide is written in our own words from the official descriptions; where a method is inferred from a description rather than stated by it, the guide says so, and every trophy cites its sources by name.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. The app is plain static files under `app/` with no build step, and it works with the network off.

Features:

- Checklist of all 55 trophies with grade badges, kind tags, missable flags and hidden-trophy handling; progress saved in localStorage, with export and import.
- Click any trophy for its full guide and sources.
- Filters by kind, grade, earned/unearned, missable only, and text search.
- Spoiler-safe mode that hides hidden story trophies until you earn them.
- Roadmap to the platinum and a missable-trophies section, both built from the official descriptions.
- Deep links for views: `?view=roadmap`, `?view=list`, `?grade=silver`, `?trophy=17`, `?filter=missable`, `?spoiler=on`.

## Sources and honesty

Trophy names, descriptions, grades and hidden status come from the official PS5 list as published by Exophase and PSNProfiles; the game had not yet been played through when this guide was written, so every guide is grounded in the official description and says so where a step is inferred. Player guides are cited by name beside the trophies where a reported count or a possibly missable flag is used. No text is copied from any other guide site.

---

<sub>Entered on [make.fun](https://make.fun/?ref=steady-ibis-93&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
