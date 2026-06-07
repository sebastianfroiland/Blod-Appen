/* =============================================================================
   GOLDEN HOUSE — meny & info  (fra menyen "Golden House Take Away 2025")
   -----------------------------------------------------------------------------
   👉 DETTE ER DEN ENESTE FILA DU TRENGER Å ENDRE FOR Å OPPDATERE MENYEN.

   Hver rett:
     { no: 1, name: "Vårrull (2 stk)", desc: "Spring roll", price: 85, alg: "H" }
       • no    = rettens nummer fra menyen (vises til kunden og på kjøkkenet)
       • name  = norsk navn
       • desc  = engelsk navn / beskrivelse (kan stå tom: "")
       • price = pris i kroner, kun tall
       • alg   = allergener, kodene under (kan stå tom: "")
       • spicy: true -> viser 🌶️ (for retter merket «sterk»)
     id lages automatisk fra nummeret — du trenger ikke røre det.

   Allergikoder:  E=Egg · H=Hvetemel · N=Peanøtter · KA=Kasjunøtter
                  SE=Sesamolje · SK=Skalldyr · SY=Soya · M=Melk
   ============================================================================ */

const SHOP = {
  name: "Golden House",
  tagline: "Kinamat & Take Away",
  place: "Stangeland",
  phone: "51 62 25 24",
  mobil: "469 08 745",
  address: "Heigreveien (krysset), rett overfor Helgø/MENY matsenteret — Stangeland/Sandved",
  hours: [
    { day: "Mandag",   time: "Stengt" },
    { day: "Tir–Lør",  time: "15:00 – 22:00" },
    { day: "Søndag",   time: "13:30 – 21:30" },
  ],
  hoursNote: "Kjøkkenet stenger 21:30 alle dager.",
  allergens: {
    E: "Egg", H: "Hvetemel", N: "Peanøtter", KA: "Kasjunøtter",
    SE: "Sesamolje", SK: "Skalldyr", SY: "Soya", M: "Melk",
  },
};

const MENU = [
  {
    id: "forretter", name: "Forretter", note: "Appetizers",
    items: [
      { no: 1, name: "Vårrull (2 stk)", desc: "Spring roll", price: 85, alg: "H" },
      { no: 2, name: "Helstekt svineribbe med søt/sur saus", desc: "Barbeque spare-ribs", price: 95, alg: "H, SY" },
      { no: 3, name: "Satay kylling på spyd", desc: "Satay chicken spyd", price: 85, alg: "H, N" },
      { no: 4, name: "Sprøstekt kongereker på Singapore vis", desc: "Deepfried kingprawns Singapore style", price: 99, alg: "H, SK" },
      { no: 5, name: "Crispy tempurareker på Japan vis (NYHET)", desc: "Crispy tempura prawns", price: 95, alg: "SK" },
      { no: 6, name: "Sprøstekt vån-tan", desc: "Deepfried won-ton", price: 85, alg: "H, SK" },
      { no: 7, name: "Krabbestikk vårrull", desc: "Deepfried crab", price: 85, alg: "H" },
      { no: 8, name: "Fritert dumpling fylt med reker (NYHET)", desc: "Money Bag", price: 85, alg: "H, SK" },
    ],
  },
  {
    id: "suppe", name: "Suppe", note: "Soup",
    items: [
      { no: 9, name: "Peking suppe (sterk)", desc: "Peking soup (sour-spicy)", price: 79, alg: "SK, E, SE", spicy: true },
      { no: 10, name: "Maissuppe med kylling og krabbestikk", desc: "Sweetcorn soup with chicken", price: 79, alg: "E, SE" },
      { no: 11, name: "Vån-tan suppe", desc: "Won-ton soup", price: 85, alg: "H, SE, SK, SY" },
      { no: 12, name: "Tomatsuppe med kylling og egg", desc: "Tomato soup with chicken", price: 79, alg: "E, SY" },
      { no: 13, name: "Thai Tom yum giu, kongereker/kylling (sterk)", desc: "Thai Tom yum giu chicken with kingprawn (spicy)", price: 89, alg: "SY, SE, SK", spicy: true },
    ],
  },
  {
    id: "oksekjott", name: "Oksekjøtt", note: "Beef",
    items: [
      { no: 14, name: "Oksekjøtt i skiver med grønnsaker", desc: "Beef chop suey", price: 185, alg: "SE, SY" },
      { no: 15, name: "Sprøstekt oksekjøtt med peppersaus", desc: "Pepper beef Chinese style", price: 195, alg: "H, SY, SE" },
      { no: 16, name: "Oksekjøtt i skiver med karri (sterk)", desc: "Beef with curry (spicy)", price: 185, alg: "M", spicy: true },
      { no: 17, name: "Sze chuan oksekjøtt (sterk++)", desc: "Beef Sze chuan style (spicy++)", price: 185, alg: "H, SE, SY", spicy: true },
      { no: 18, name: "Oksekjøtt med ananas", desc: "Beef with pineapplesauce", price: 185, alg: "SY" },
      { no: 19, name: "Oksekjøtt i skiver med brokkoli", desc: "Beef with broccoli", price: 185, alg: "H, SY, SE" },
      { no: 20, name: "Frityrstekt oksekjøtt på kinesisk vis", desc: "Beef chinese style", price: 195, alg: "H, SY" },
      { no: 21, name: "Oksekjøtt i skiver og Xosaus", desc: "Beef with XO sauce", price: 185, alg: "H, SY, E, SE, SK" },
      { no: 22, name: "Oksekjøtt i skiver på Shanghai vis (sterk)", desc: "Beef shanghai style (spicy)", price: 185, alg: "SY, SE", spicy: true },
      { no: 23, name: "Oksekjøtt, svinekjøtt, kylling, kongereke med grønnsaker", desc: "Beef, pork, chicken, kingprawn chop suey", price: 205, alg: "H, SY, SE" },
      { no: 24, name: "Oksekjøtt i skiver med kasjunøtter og chillisaus (sterk)", desc: "Beef with cashewnuts and chilli sauce (spicy)", price: 195, alg: "H, SE, KA, SY", spicy: true },
      { no: 25, name: "Indrefilet i skiver med mango", desc: "Fillet of beef with mango", price: 255, alg: "SY, SE" },
      { no: 26, name: "Indrefilet med peppersaus", desc: "Tenderloin with peppersauce", price: 255, alg: "SY, SE" },
      { no: 27, name: "Indrefilet med grønnsaker og XO saus", desc: "Tenderloin with XO sauce", price: 255, alg: "SK, SY, SE" },
      { no: 28, name: "Indrefilet med brokkoli", desc: "Tenderloin with broccoli", price: 255, alg: "SY, SE" },
      { no: 29, name: "Indrefilet på Sze chuan vis (sterk++)", desc: "Tenderloin Sze chuan style (spicy++)", price: 255, alg: "H, SY, SE", spicy: true },
      { no: 30, name: "Indrefilet på kinesisk vis", desc: "Tenderloin Chinese style", price: 255, alg: "H" },
      { no: 31, name: "Oksekjøtt i skiver på Thai vis (sterk)", desc: "Beef thai style (spicy)", price: 255, alg: "H, SE, M, SY", spicy: true },
      { no: 35, name: "Oksekjøtt i skiver med satay saus", desc: "Beef with satay sauce", price: 185, alg: "N, SE, M, SY" },
    ],
  },
  {
    id: "svinekjott", name: "Svinekjøtt", note: "Pork",
    items: [
      { no: 32, name: "Sze chuan svinekjøtt (sterk++)", desc: "Pork Sze chuan style (spicy++)", price: 179, alg: "H, SY, SE", spicy: true },
      { no: 33, name: "Svinekjøtt med grønnsaker (chop suey)", desc: "Pork chop suey", price: 179, alg: "H, SY, SE" },
      { no: 34, name: "Frityrstekt svinekjøtt med søt/sur saus", desc: "Sweet and sour Deepfried pork", price: 189, alg: "H, E" },
      { no: 36, name: "Helstekt svineribbe med søt/sur saus", desc: "Barbeque spare-ribs with sweet sour sauce & salad", price: 205, alg: "H, SY, SE" },
      { no: 38, name: "Frityrstekt svinekoteletter med pommes frites", desc: "Deepfried pork chops & salad", price: 205, alg: "H" },
      { no: 39, name: "Frityrstekt svinekjøtt med peppersaus", desc: "Deepfried pork with pepper sauce", price: 189, alg: "H, SE, E" },
    ],
  },
  {
    id: "kylling", name: "Kylling", note: "Chicken",
    items: [
      { no: 40, name: "Kylling i skiver med grønnsaker", desc: "Chicken chop suey", price: 179, alg: "SY, SE" },
      { no: 41, name: "Frityrstekt kylling med peppersaus", desc: "Deepfried chicken with peppersauce", price: 189, alg: "H, SY, SE, E" },
      { no: 42, name: "Kylling i skiver med karri (sterk)", desc: "Chicken with curry (spicy)", price: 179, alg: "M", spicy: true },
      { no: 43, name: "Kylling i skiver med kasjunøtter", desc: "Chicken with cashewnuts", price: 189, alg: "H, SY, SE, KA" },
      { no: 44, name: "Kylling i skiver med ananas", desc: "Chicken with pineapplesauce", price: 179, alg: "SE, M" },
      { no: 45, name: "Kylling i skiver på Sze chuan saus (sterk)", desc: "Chicken Sze Chuan sauce (spicy)", price: 179, alg: "H, SY, SE", spicy: true },
      { no: 46, name: "Kylling i skiver med gon bao kasjunøtter (sterk)", desc: "Chicken with gon bao cashewnuts (spicy)", price: 189, alg: "H, SY, SE, KA", spicy: true },
      { no: 47, name: "Kylling i skiver med Hoisinsaus og kasjunøtter", desc: "Chicken with Hoisin sauce cashewnuts", price: 189, alg: "H, SY, SE, KA" },
      { no: 48, name: "Frityrstekt kylling i skiver med sitronsaus", desc: "Deepfried chicken with lemon sauce", price: 189, alg: "H, SY, E" },
      { no: 49, name: "Kylling i skiver med chillisaus og kasjunøtter (sterk)", desc: "Chicken with chillisauce & cashewnuts (spicy)", price: 189, alg: "H, SE, KA", spicy: true },
      { no: 201, name: "Frityrstekt kylling med søt/sur saus", desc: "Sweet and sour deepfried chicken", price: 189, alg: "H, E" },
      { no: 202, name: "Kylling på Thai vis (sterk)", desc: "Chicken Thai style (spicy)", price: 179, alg: "H, SY, SE", spicy: true },
      { no: 203, name: "Satay kylling på spyd", desc: "Satay chicken", price: 205, alg: "H, N" },
    ],
  },
  {
    id: "and", name: "And", note: "Duck",
    items: [
      { no: 50, name: "Peking and", desc: "Peking duck", price: 265, alg: "H, SY, SE" },
      { no: 51, name: "Helstekt and i skiver med appelsinsaus", desc: "Duck with orangesauce", price: 255, alg: "" },
      { no: 52, name: "And i skiver med grønnsaker og XO saus", desc: "Duck with vegetables & XO sauce", price: 255, alg: "H, SK, SY, SE" },
      { no: 53, name: "Frityrstekt and på Sze chuan vis (sterk)", desc: "Deepfried duck Sze chuan style (spicy)", price: 255, alg: "H, SY, SE", spicy: true },
      { no: 54, name: "Frityrstekt and med peppersaus", desc: "Deepfried duck with peppersauce", price: 255, alg: "H, E" },
      { no: 55, name: "Frityrstekt and med søt/sur saus", desc: "Deepfried duck with sweet and sour sauce", price: 255, alg: "H, E" },
    ],
  },
  {
    id: "lam", name: "Lam", note: "Lamb",
    items: [
      { no: 56, name: "Lammekjøtt i skiver med vårløk og ingefær (sterk)", desc: "Lamb with leek (spicy)", price: 219, alg: "H, SY, SE", spicy: true },
      { no: 57, name: "Lammekjøtt i skiver med peppersaus (sterk)", desc: "Lamb with pepper sauce (spicy)", price: 219, alg: "H, SY, SE", spicy: true },
      { no: 58, name: "Lammekjøtt i skiver med chillisaus (sterk)", desc: "Lamb with chillisauce (spicy)", price: 219, alg: "H, SY, SE", spicy: true },
      { no: 59, name: "Lammekjøtt i skiver med karri (sterk)", desc: "Lamb with curry sauce (spicy)", price: 219, alg: "H, M", spicy: true },
    ],
  },
  {
    id: "kongereker", name: "Kongereker", note: "Kingprawns",
    items: [
      { no: 60, name: "Kongereker med grønnsaker og XO saus", desc: "Kingprawns with XO sauce", price: 219, alg: "H, SY, SE, SK" },
      { no: 61, name: "Frityrstekt kongereker med appelsinsaus", desc: "Deepfried kingprawns with orangesauce", price: 219, alg: "H, E, SE, SK" },
      { no: 62, name: "Kongereker med karri (sterk)", desc: "Kingprawns with curry (spicy)", price: 219, alg: "H, M, SK", spicy: true },
      { no: 63, name: "Frityrstekt kongereker med peppersaus", desc: "Deepfried kingprawns with peppersauce", price: 219, alg: "H, SY, SE, E, SK" },
      { no: 64, name: "Frityrstekt kongereker på kinesisk vis", desc: "Deepfried kingprawns Chinese style", price: 219, alg: "H, E, SE, SK" },
      { no: 65, name: "Frityrstekt kongereker på Thai vis (sterk)", desc: "Deepfried kingprawns Thai style (spicy)", price: 219, alg: "H, E, SE, SK", spicy: true },
      { no: 67, name: "Innbakt kongereker med søt/sur saus", desc: "Deepfried kingprawns with sweet and sour sauce", price: 219, alg: "H, SE, SK" },
    ],
  },
  {
    id: "stekt-ris", name: "Stekt ris", note: "Fried rice",
    items: [
      { no: 81, name: "Stekt ris med kylling, skinke og reker", desc: "Fried rice de luxe", price: 165, alg: "SY, E, SK" },
      { no: 82, name: "Stekt ris med oksekjøtt på Taiwan vis", desc: "Fried rice Taiwan style", price: 169, alg: "H, SY, E" },
      { no: 83, name: "Stekt ris med kongereker, vårløk og svinekjøtt", desc: "Fried rice with kingprawns and pork", price: 179, alg: "H, SY, SE" },
      { no: 84, name: "Stekt ris med karri (kongereker, kylling) (sterk)", desc: "Fried rice with curry kingprawns and chicken (spicy)", price: 179, alg: "H, E, SK", spicy: true },
      { no: 85, name: "Stekt ris med kylling på Thai vis (sterk)", desc: "Fried rice with chicken Thai style (spicy)", price: 169, alg: "SY, E", spicy: true },
    ],
  },
  {
    id: "risnudler", name: "Risnudler & nudler", note: "Ricenoodles",
    items: [
      { no: 86, name: "Stekt risnudler med oksekjøtt", desc: "Fried ricenoodles with beef", price: 199, alg: "SY, E" },
      { no: 87, name: "Stekt risnudler med kylling", desc: "Fried ricenoodles with chicken", price: 199, alg: "SY, E" },
      { no: 88, name: "Stekt risnudler med svinekjøtt", desc: "Fried ricenoodles with pork", price: 199, alg: "SY, E" },
      { no: 89, name: "Stekt risnudler med helstekt svinekjøtt", desc: "Fried ricenoodles barbeque pork", price: 199, alg: "H, E, SY" },
      { no: 90, name: "Stekt risnudler med oksekjøtt, svinekjøtt, kylling og kongereke", desc: "Fried ricenoodles with beef, pork, chicken, kingprawn", price: 219, alg: "H, SY, SE, E, SK" },
      { no: 91, name: "Stekt risnudler med kylling på Thai vis (sterk)", desc: "Fried ricenoodles with chicken Thai style (spicy)", price: 199, alg: "H, E, N", spicy: true },
      { no: 92, name: "Kinesisk omelett (kylling, løk)", desc: "Chinese omelett with chicken", price: 150, alg: "SY, E" },
      { no: 93, name: "Kinesisk rekeomelett (reker/skinke)", desc: "Chinese omelett with shrimp/ham", price: 150, alg: "SY, E, SK" },
      { no: 206, name: "Stekt risnudler m. kongereke og helstekt svinekjøtt på Singapore vis (sterk)", desc: "Fried ricenoodles with kingprawn, barbequepork Singapore style (spicy)", price: 219, alg: "E, H, SE, SK", spicy: true },
    ],
  },
  {
    id: "barn", name: "Barnemeny", note: "Children menu",
    items: [
      { no: 95, name: "Nuggets kylling med pommes frites", desc: "Nuggets chicken with chips", price: 89, alg: "H" },
      { no: 96, name: "Pølse med pommes frites", desc: "Sausage with chips", price: 89, alg: "H" },
      { no: 99, name: "Stekt ris med kylling, skinke og reker", desc: "Fried rice de luxe", price: 89, alg: "E, SY, SK" },
      { no: 100, name: "Pommes frites", desc: "Chips", price: 60, alg: "H" },
    ],
  },
  {
    id: "lunsj", name: "Lunsj", note: "Tir–Lør kl. 15–18 (ikke søn/helligdag)",
    items: [
      { no: 110, name: "Stekt ris med kylling, reker og skinke", desc: "Fried rice de luxe", price: 145, alg: "E, SY, SK" },
      { no: 111, name: "Stekt ris med karri (sterk)", desc: "Fried rice de luxe with curry (spicy)", price: 145, alg: "SY, E", spicy: true },
      { no: 112, name: "Oksekjøtt med grønnsaker", desc: "Beef chop suey", price: 165, alg: "SY, E, H" },
      { no: 113, name: "Svinekjøtt med grønnsaker", desc: "Pork chop suey", price: 159, alg: "SY, SE" },
      { no: 114, name: "Kylling med grønnsaker", desc: "Chicken chop suey", price: 159, alg: "SY, SE" },
      { no: 115, name: "Kylling med karri", desc: "Chicken with curry", price: 159, alg: "H, M" },
      { no: 116, name: "Frityrstekt oksekjøtt med peppersaus", desc: "Peppersauce beef chinese style", price: 175, alg: "H, SY, SE, E" },
      { no: 117, name: "Frityrstekt kylling med peppersaus", desc: "Deepfried chicken with pepper sauce", price: 175, alg: "H, SY, SE, E" },
      { no: 118, name: "Frityrstekt svinekjøtt med søt/sur saus", desc: "Deepfried pork with sweet and sour sauce", price: 175, alg: "H, E" },
      { no: 119, name: "Frityrstekt kylling med søt/sur saus", desc: "Deepfried chicken with sweet and sour sauce", price: 175, alg: "H, E" },
      { no: 120, name: "Helstekt svineribbe med pommes frites & salat", desc: "Barbeque spare-ribs with chips & salad", price: 175, alg: "H" },
      { no: 121, name: "Vårrull med pommes frites og salat", desc: "Spring roll w/ chips & salad", price: 169, alg: "H" },
      { no: 122, name: "Stekt risnudler med oksekjøtt", desc: "Fried ricenoodles with beef", price: 169, alg: "H, SY, SE, E" },
      { no: 123, name: "Stekt risnudler med kylling på Thai vis (sterk)", desc: "Fried ricenoodles with chicken Thai style (spicy)", price: 169, alg: "N, SY, E", spicy: true },
      { no: 125, name: "Oksekjøtt i skiver med karri (sterk)", desc: "Beef with curry (spicy)", price: 165, alg: "M", spicy: true },
      { no: 126, name: "Oksekjøtt i skiver på Shanghai vis (sterk)", desc: "Beef Shanghai style (spicy)", price: 165, alg: "H, SE, SY", spicy: true },
    ],
  },
  {
    id: "ekstra", name: "Ekstra & drikke", note: "Extras & drinks",
    items: [
      { no: null, name: "Ekstra kjøtt", desc: "", price: 65, alg: "" },
      { no: null, name: "Ekstra ris (1 pers) eller 1 skål saus", desc: "", price: 40, alg: "" },
      { no: null, name: "Ekstra grønnsaker", desc: "", price: 15, alg: "" },
      { no: null, name: "Ekstra kasjunøtter", desc: "", price: 25, alg: "KA" },
      { no: null, name: "Ekstra soyasaus eller chilisaus", desc: "", price: 15, alg: "SY" },
      { no: null, name: "Stekt ris istedenfor kokt ris", desc: "", price: 65, alg: "" },
      { no: null, name: "Pommes frites istedenfor kokt ris", desc: "", price: 35, alg: "H" },
      { no: null, name: "Rekechips", desc: "", price: 50, alg: "SK" },
      { no: null, name: "En pose frityrstekt kylling / svinekjøtt", desc: "", price: 115, alg: "H" },
      { no: null, name: "En pose frityrstekt oksekjøtt", desc: "", price: 125, alg: "H" },
      { no: null, name: "Brus 0,5 liter", desc: "", price: 30, alg: "" },
      { no: null, name: "Brus 1,5 liter", desc: "", price: 50, alg: "" },
    ],
  },
];

// Lag en unik id pr. rett automatisk (fra nummer, ellers fra navn).
MENU.forEach((cat) => {
  cat.items.forEach((it, i) => {
    it.id = it.no != null ? "nr" + it.no : cat.id + "-" + i;
  });
});

// Gjør tilgjengelig for app.js / monitor.html
window.GOLDEN_HOUSE = { SHOP, MENU };
