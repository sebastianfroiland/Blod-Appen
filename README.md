# Blod

Lys, iOS-inspirert helseapp for blodprøvesvar. **React + Tailwind + Framer Motion.**

```bash
npm install
npm run dev
```

## Flyt

**Login** (prøvekode / BankID) → **Hjem** med helsescore-ring og valg:

- **Testresultat** — 32 markører i 7 grupper. Testvelger (tre prøver), kategorier
  (Trening · Energi · Hjerte · Immunforsvar · Langtidshelse), søk, 270°-buemålere,
  delta mot forrige prøve, sparklines og legens kommentar
- **Utvikling** — selvtegnende trendlinjer siden 2023
- **Blodgivning** — liter gitt, liv hjulpet, årets mål, historikk
- **Profil** — deling, PDF, logg ut

Deep-link for utvikling/demo: `?demo=1&tab=resultater` hopper rett inn i en fane.
Screenshots: `node scripts/shot.mjs <url> <fil> [bredde] [høyde]` (krever `npx playwright install chromium`).

## Design

- Hvit notatbok-bakgrunn med prikk-rutenett
- Liquid glass-paneler (iOS-stil) med myke skygger
- Instrument Serif + Geist + JetBrains Mono
- Flytende glass-tab-bar nederst
- Aksent: blodrød `#C41E3A`, grønn `#15A86B`

Simulerte data — ikke medisinsk rådgivning.
