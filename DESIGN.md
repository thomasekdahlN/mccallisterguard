# Homey Alone Guard — Design og visuell identitet

Et forslag til fargepalett og ikoner for appen. Konseptet er proaktiv
avskrekking i *Alene Hjemme*-stil, og designet bør balansere **trygghet**
med **aktivitet/alarm** — med et lite nikk til vinter-/julestemningen i
filmen, uten å bli en jule-app.

---

## Del 1: Fargepalett

| Funksjon | Hex | Beskrivelse / bruk |
|---|---|---|
| **Primær / Trygghet** | `#1A531A` | Mørk skoggrønn. Hovedfargen. Representerer trygghet, hjemmet og et stabilt system. Brukes for «Hjemme»-modus og generelle UI-elementer. |
| **Aktiv / Simulering** | `#F2A900` | Gull/rav. Representerer lys, varme, aktivitet og Kevin-modus. Lyser opp når simuleringen kjører. |
| **Advarsel / Alarm** | `#D32F2F` | Klar rød. Brukes kun for kritiske varsler, eskalering og full alarm. Skiller seg tydelig fra de andre fargene. |
| **Natt / Skallsikring** | `#102A43` | Dyp marinblå. Representerer natten og overvåking. Brukes for «Skallsikring»-modus. |
| **Bakgrunn (mørk)** | `#121212` | Nesten svart. For Homeys mørke modus. |
| **Tekst / ikoner (lys)** | `#FFFFFF` | Hvit. Hovedfarge for ikoner og tekst på mørk bakgrunn. |

### Hvorfor denne paletten?

Kombinasjonen av mørk grønn, gull og rød gir en subtil assosiasjon til
julefeiringen i *Alene Hjemme*, men fargene er tonet ned slik at de fungerer
året rundt som et seriøst sikkerhetssystem. Blåfargen gir en tydelig
skillelinje for nattmodus.

---

## Del 2: Ikondesign

Stilen bør være **flatt vektor-design** med tykke, rene linjer, slik at
ikonene er lesbare også i liten størrelse.

### A. App-ikon (hovedikonet)

Ikonet i Homey-oversikten. Må fange essensen av «Homey Alone Guard».

* **Konsept:** kombinasjon av et beskyttende skjold og Kevin McCallisters
  ikoniske silhuett.
* **Beskrivelse:** et skjold i mørk skoggrønn (`#1A531A`) med en lys gullkant
  (`#F2A900`). Sentrert på skjoldet en forenklet hvit silhuett av en person i
  en *Alene Hjemme*-pose hendene på kinnene i sjokk

### B. Modus-ikoner

Intuitive og tydelig forskjellige fra hverandre.

#### Hjemme (Deaktivert)

* **Ikon:** klassisk hus med en dør.
* **Farge:** hvit kontur på Homey-bakgrunn, eller fylt med mørk grønn
  (`#1A531A`) når aktiv.
* **Betydning:** huset er trygt og åpent, ingen simulering.

#### Borte (Full overvåking + Kevin-simulering)

* **Ikon:** stilisert silhuett av en person som går ut av en dør, med en
  roterende lysstråle (fyrlykt/søkelys) over huset.
* **Farge:** gull/rav (`#F2A900`) fyll eller kontur når aktiv.
* **Betydning:** huset passer på seg selv og simulerer aktivitet.

#### Skallsikring (Perimeter)

* **Ikon:** kontur av et hus sett ovenfra (planløsning), tykke linjer langs
  ytterveggene og en lukket hengelås i midten.
* **Farge:** dyp marinblå (`#102A43`) fyll eller kontur når aktiv.
* **Betydning:** grensen er låst, innsiden er fri.

### C. Funksjons- og sone-ikoner

Brukes i innstillinger og på flow-kort.

| Konsept | Ikon | Farge | Betydning |
|---|---|---|---|
| **Sone-basert avskrekking (sone-matrise)** | Boks delt i fire kvadranter, pil fra én kvadrant til en annen | Hvit kontur | Bevegelse her trigger handling der. |
| **Adaptiv media / Kevin-modus** | TV-skjerm med bjeffende hund-silhuett inni, lyspære-kontur over skjermen | Hvit kontur | Casting av video/lyd og lysstyring. |
| **Lys-autorisering** | Hånd som trykker på en lysbryter, med et lite sjekkmerke (✓) ved siden av | Hvit kontur | Manuell lysbruk godkjennes. |
| **Eskalering / krise-nivå** | Megafon med tre lydbølger og en lyn-kontur inni | Klar rød (`#D32F2F`) | Full sirene og strobe. |
| **Falsk-alarm-filter** | To–tre bevegelsessensor-ikoner på rad, med en trakt/filter under | Hvit kontur | Krever flere treff. |

### D. Flow-kort-ikoner

Forenklede versjoner av modus-ikonene, i Homeys standard sirkulære format.

* **Trigger (Når…):** sensor (f.eks. en dør som åpnes) med en liten rød prikk
  i hjørnet.
* **Betingelse (Og…):** vekt-skål i balanse, med Homey Alone Guard-skjoldet
  på den ene siden.
* **Handling (Så…):** løpende mann-silhuett (tyven) som snur og løper i
  motsatt retning.

---

## Oppsummering av visuell stil

* **Stil:** minimalistisk, flatt vektor-design.
* **Linjer:** tykke og tydelige for god lesbarhet på små skjermer.
* **Farger:** bruk paletten konsekvent:
  * 🟢 grønn = trygg
  * 🟡 gull = aktiv / simulerer
  * 🔴 rød = alarm
  * 🔵 blå = natt
