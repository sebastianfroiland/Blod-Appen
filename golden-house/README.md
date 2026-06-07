# Golden House — digital bestilling 🥡

En enkel nettside for **Golden House**, kinamat & take away i Stangeland, så folk kan
bestille uten å ringe. Tema: en håndtegnet **tavle** — hvit bakgrunn, svart og rød
tusj, og en skisse av sjappa som tegner seg selv inn øverst.

Helt enkel og «ren» løsning: bare HTML, CSS og litt JavaScript. **Ingen byggesteg,
ingen rammeverk.** Du kan åpne den rett i nettleseren.

```
golden-house/
├── index.html     ← kundesiden (bestilling)
├── styles.css     ← utseendet (tavle-temaet)
├── app.js         ← logikken (handlekurv + bestilling)
├── menu.js        ← 👈 MENYEN — den eneste fila du trenger å endre
├── monitor.html   ← kjøkkenskjerm (fase 2, fungerer som demo nå)
└── README.md      ← denne fila
```

## Se nettsiden

Dobbeltklikk på `index.html`, eller — best, så fungerer kjøkkenskjermen også —
kjør en liten lokal server fra mappa:

```bash
# alternativ 1 (Node):
npx serve golden-house

# alternativ 2 (Python):
python -m http.server -d golden-house 8080
```

Åpne så adressen den skriver ut (f.eks. http://localhost:8080).

## ✏️ Endre menyen (det vanligste)

Hele menyen fra **«Golden House Take Away 2025»** er lagt inn. Alt ligger i
**`menu.js`** — åpne den i en teksteditor. Hver rett ser slik ut:

```js
{ no: 42, name: "Kylling i skiver med karri (sterk)", desc: "Chicken with curry (spicy)", price: 179, alg: "M", spicy: true },
```

- `no` – rettens nummer fra menyen (vises til kunden og på kjøkkenet)
- `name` – norsk navn
- `desc` – engelsk navn / beskrivelse (kan være tom: `""`)
- `price` – pris i kroner, bare tall
- `alg` – allergener (kodene står øverst i fila; kan være tom: `""`)
- valgfritt: `spicy: true` gir 🌶️ (for retter merket «sterk»)

`id`-en lages automatisk — den trenger du ikke røre. Rekkefølgen i fila =
rekkefølgen på siden. **Forretter står først.**

Øverst i `menu.js` ligger også **telefon, mobil, adresse og åpningstider**.

> ✅ Dobbeltsjekk gjerne disse prisene mot papirmenyen, de var litt vanskelige å
> lese på bildet: **nr. 31** (oksekjøtt Thai vis) og **nr. 203** (satay kylling).
> Allergenkodene for **nr. 51** og **nr. 85** var delvis skjult — verdt et raskt blikk.

## Legge nettsiden ut på nett (gratis)

- **Netlify Drop** – dra `golden-house`-mappa inn på <https://app.netlify.com/drop>.
  Får en lenke med en gang.
- **GitHub Pages** – legg mappa i et repo og slå på Pages.
- **Cloudflare Pages / Vercel** – fungerer like enkelt.

Alt er statiske filer, så det koster ingenting å hoste.

## 🖥️ Kjøkkenskjermen (`monitor.html`) — fase 2

Tanken din om en egen skjerm på kjøkkenet som viser bestillingene er bygget inn som
en **mørk tavle** (mindre gjenskinn på kjøkkenet). Hver bestilling kommer opp som en
lapp med nummer, navn, telefon, hentetid, retter og total — med et lite *ding* når en
ny ordre kommer. Trykk **✓ Ferdig** når den er pakket.

**Slik er den nå (demo):** kundesiden lagrer bestillinger lokalt i nettleseren, og
`monitor.html` leser de samme bestillingene. Det betyr at demoen virker når begge
sidene er åpne i **samme nettleser på samme maskin** (kjør via den lokale serveren
over for at de skal dele data).

**For ekte drift** (kunde bestiller hjemmefra → dukker opp på kjøkkenet med en gang)
trenger vi et lite **bakende-ledd** som tar imot og kringkaster bestillinger. Aktuelle,
rimelige måter:

1. **Liten server + live oppdatering** (f.eks. Supabase / Firebase, eller en enkel
   Node-tjeneste). Kunden sender ordren dit; kjøkkenskjermen lytter og oppdaterer seg
   selv i sanntid. Ryddigste «egen skjerm»-løsningen.
2. **Meldingsbasert** som mellomløsning: ordren sendes som ferdig utfylt **WhatsApp**-
   eller **SMS**-melding til sjappa. Null server, men ingen egen skjerm.

Stedet i koden hvor den ekte sendingen kobles på er markert i `app.js`:

```js
// 👉 PHASE 2: this is where the order gets sent to the kitchen for real
```

Si fra hvilken retning du vil gå, så setter jeg det opp.

---

Laget med ❤️ for nabolaget.
