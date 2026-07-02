# Homey App Playbook — Thomas Ekdahl

Generisk oppskrift basert på erfaringene fra McCallisterGuard. Bruk dette som utgangspunkt for neste app.

---

## 1. Scaffold nytt prosjekt

```bash
npm install -g homey          # CLI, kun én gang
homey login                   # logg inn med Athom-konto
homey app create              # interaktiv wizard: id, navn, kategori, SDK 3
```

Velg **TypeScript** og **SDK 3** i wizard. App-ID følger reverse-domain-format: `com.ekdahl.appnavn`.

---

## 2. Installer dev-avhengigheter

```bash
npm install --save-dev \
  typescript \
  @tsconfig/node16 \
  "@types/homey@npm:homey-apps-sdk-v3-types" \
  @types/node \
  eslint \
  eslint-config-athom \
  vitest \
  husky
```

```bash
npm install --save homey-api   # kun hvis appen trenger tilgang til devices/zones via API
```

---

## 3. Konfigurasjonsfiler

**`tsconfig.json`** — kopier direkte:
```json
{
  "compilerOptions": {
    "lib": ["es2021"],
    "module": "node16",
    "target": "es2021",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node16",
    "allowJs": true,
    "outDir": ".homeybuild/",
    "types": ["node", "homey"]
  },
  "exclude": ["node_modules", ".homeybuild", "test", "vitest.config.ts"]
}
```

**`vitest.config.ts`**:
```typescript
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { include: ['test/**/*.test.ts'], environment: 'node', globals: false },
});
```

**`package.json` scripts**:
```json
{
  "scripts": {
    "build": "tsc",
    "lint": "eslint --ext .js,.ts --ignore-path .gitignore .",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

---

## 4. Mappestruktur

```
app.ts                         # Hovedklasse — extends Homey.App
api.ts                         # Intern HTTP API for settings UI
app.json                       # Generert — IKKE rediger direkte
.homeycompose/
  app.json                     # Rediger denne (id, version, permissions, images, api)
  flow/
    triggers/                  # Én JSON per trigger-kort
    conditions/                # Én JSON per condition-kort
    actions/                   # Én JSON per action-kort
lib/                           # Moduler (StateMachine, EventLog, osv.)
  types.ts                     # Delte typer og SETTINGS_KEYS-enum
settings/
  index.html                   # Settings UI — vanilla JS, ingen build-steg
assets/
  icon.svg                     # SVG app-ikon (required)
  images/
    small.png   (250×175)      # Required for App Store
    large.png   (500×350)      # Required for App Store
    xlarge.png  (1000×700)     # Required for App Store
  media/                       # Bundlede lydfiler / videoer (ogg, mp4, m4a)
locales/
  en.json                      # Påkrevd — engelsk oversettelse
  no.json                      # Valgfritt — norsk
test/
  helpers/
    mockHomey.ts               # Gjenbrukbar mock for Homey-objektet
  *.test.ts                    # Vitest-tester
```

---

## 5. app.json minimumskrav (for App Store)

```json
{
  "id": "com.ekdahl.appnavn",
  "version": "0.1.0",
  "compatibility": ">=12.4.0",
  "sdk": 3,
  "runtime": "nodejs",
  "platforms": ["local"],
  "name": { "en": "App Name" },
  "description": { "en": "Short description, max 255 chars." },
  "category": ["tools"],
  "brandColor": "#123456",
  "images": {
    "small": "/assets/images/small.png",
    "large": "/assets/images/large.png",
    "xlarge": "/assets/images/xlarge.png"
  },
  "author": { "name": "Thomas Ekdahl", "email": "thomas@ekdahl.no" }
}
```

---

## 6. Permissions

| Behov | Permission |
|---|---|
| Lese/skrive til devices og zones | `homey:manager:api` |
| Sende push-notifikasjoner | Ingen — `homey.notifications` er alltid tilgjengelig |
| Lese flows | Ikke mulig programmatisk for tredjepartsapper |

---

## 7. Flow-kort — JSON-struktur

**Trigger** (`.homeycompose/flow/triggers/my_trigger.json`):
```json
{
  "title": { "en": "Something happened", "no": "Noe skjedde" },
  "titleFormatted": { "en": "Something happened at [[zone]]", "no": "..." },
  "tokens": [
    { "name": "zone", "type": "string", "title": { "en": "Zone" } },
    { "name": "timestamp", "type": "string", "title": { "en": "Timestamp" } }
  ]
}
```

**Condition** (`.homeycompose/flow/conditions/my_condition.json`):
```json
{
  "title": { "en": "Something !{{is|is not}} active" },
  "titleFormatted": { "en": "Something !{{is|is not}} active" }
}
```

**Action med output-token** (`.homeycompose/flow/actions/my_action.json`):
```json
{
  "title": { "en": "Do something" },
  "titleFormatted": { "en": "Do something with [[input]]" },
  "args": [
    { "name": "input", "type": "dropdown", "values": [
      { "id": "option_a", "label": { "en": "Option A" } }
    ]}
  ],
  "tokens": [
    { "name": "result", "type": "string", "title": { "en": "Result" },
      "example": { "en": "example value" } }
  ]
}
```

---

## 8. Registrere flow-kort i app.ts

```typescript
// Trigger
const trigger = this.homey.flow.getTriggerCard('my_trigger');
await trigger.trigger({ zone: 'Living room', timestamp: new Date().toISOString() });

// Condition
this.homey.flow.getConditionCard('my_condition')
  .registerRunListener(async () => this.someState === true);

// Action med output-token
this.homey.flow.getActionCard('my_action')
  .registerRunListener(async (args: { input: string }) => {
    return { result: `processed: ${args.input}` };
  });
```

---

## 9. Globale flow-tokens (permanente pills i flow-editoren)

Registrer ved oppstart i `onInit` — vises som pills under appens seksjon i alle flow-actions:

```typescript
const token = await this.homey.flow.createToken('my_token_id', {
  type: 'string',
  title: 'My Token',
  value: 'initial value',
});
await token.setValue('updated value');
```

---

## 10. Snapshot / Image-token

Bruk **alltid `setStream()`** — `setPath()` finnes ikke i SDK v3:

```typescript
const image = await this.homey.images.createImage();
image.setStream(async (stream) => {
  const fileStream = fs.createReadStream('/path/to/file.jpg');
  fileStream.pipe(stream);
});
// Bruk image-objektet som token i trigger
await trigger.trigger({ snapshot: image });
```

---

## 11. Mock for testing (test/helpers/mockHomey.ts)

```typescript
import { vi } from 'vitest';

export function createMockHomey(initial: Record<string, unknown> = {}) {
  const store: Record<string, unknown> = { ...initial };
  return {
    settings: {
      _store: store,
      get: vi.fn((key: string) => store[key] ?? null),
      set: vi.fn((key: string, value: unknown) => { store[key] = value; }),
    },
    setTimeout, clearTimeout, setInterval, clearInterval,
  };
}
```

Eksempel test:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockHomey } from './helpers/mockHomey';
import MyModule from '../lib/MyModule';

describe('MyModule', () => {
  let homey: ReturnType<typeof createMockHomey>;

  beforeEach(() => {
    vi.useFakeTimers();
    homey = createMockHomey({ my_setting: 42 });
  });

  it('does something', () => {
    const m = new MyModule(homey as never);
    expect(m.getValue()).toBe(42);
  });
});
```

**Kjør tester:**

```bash
npx tsc --noEmit        # typesjekk først — fanger feil uten å bygge
npx vitest run          # kjør alle tester én gang
npx vitest              # watch-modus under utvikling
npx vitest run --reporter=verbose   # vis hvert enkelt test-navn
```

**Alltid kjør begge:** `npx tsc --noEmit && npx vitest run`

---

## 11b. Feature-tester — hva som skal dekkes

Skriv feature-tester for **alle nye moduler og tilstandsmaskiner**. Testene skal simulere reelle brukerscenarier, ikke bare enkelt-metoder.

**Hva en god feature-test dekker:**

| Scenario | Eksempel |
|---|---|
| Starttilstand | Modul starter i riktig default-tilstand |
| Persistering | Tilstand lagres til og lastes fra `settings` |
| Tilstandsoverganger | Alle gyldige modus-skifter fungerer korrekt |
| Timere | `exit_delay` og `entry_delay` utløser riktig etter N sekunder |
| Grenseverdier | Hva skjer ved ugyldig input eller kantsituasjoner? |
| Avhengigheter | Modulen reagerer riktig på hendelser fra andre moduler |

**Bruk `vi.useFakeTimers()` for alle tester med tidsforsinkelse:**

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockHomey } from './helpers/mockHomey';
import StateMachine from '../lib/StateMachine';
import EventLog from '../lib/EventLog';
import { SETTINGS_KEYS } from '../lib/types';

describe('StateMachine — feature tests', () => {
  let homey: ReturnType<typeof createMockHomey>;
  let log: EventLog;

  beforeEach(() => {
    vi.useFakeTimers();
    homey = createMockHomey();
    log = new EventLog(homey as never);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in disarmed when no saved mode exists', () => {
    const sm = new StateMachine(homey as never, log);
    expect(sm.getMode()).toBe('disarmed');
  });

  it('restores mode from settings on startup', () => {
    homey.settings._store[SETTINGS_KEYS.MODE] = 'armed_perimeter';
    const sm = new StateMachine(homey as never, log);
    expect(sm.getMode()).toBe('armed_perimeter');
  });

  it('applies exit delay before arming', async () => {
    const sm = new StateMachine(homey as never, log);
    await sm.setMode('armed', 30);          // 30 s exit delay

    expect(sm.getMode()).toBe('disarmed');   // still disarmed during delay
    expect(sm.isExitDelayActive()).toBe(true);

    vi.advanceTimersByTime(30_000);          // fast-forward 30 s
    expect(sm.getMode()).toBe('armed');
    expect(sm.isExitDelayActive()).toBe(false);
  });

  it('persists mode change timestamp to settings', async () => {
    vi.setSystemTime(new Date('2025-06-01T12:00:00Z'));
    const sm = new StateMachine(homey as never, log);
    await sm.setMode('armed_perimeter');
    expect(homey.settings._store[SETTINGS_KEYS.MODE_CHANGED_AT])
      .toBe(new Date('2025-06-01T12:00:00Z').getTime());
  });
});
```

**Navnekonvensjon for testfiler:**

```
test/
  StateMachine.test.ts       # én fil per lib-modul
  EventLog.test.ts
  FalseAlarmFilter.test.ts
  helpers/
    mockHomey.ts             # delt mock — ikke dupliser
```

---

## 12. Settings UI (settings/index.html)

- Ren HTML + vanilla JS — ingen React/Vue/build-steg
- Kommuniserer med app via `Homey.get('endpointName', args)` og `Homey.set(...)` — tilsvarer `api.ts`-metodene
- `api.ts` eksporterer metoder som kalles av Homey-plattformen når settings-siden gjør requests

---

## 13. Intern HTTP API (api.ts)

```typescript
import Homey from 'homey';

module.exports = {
  async getStatus({ homey }: { homey: Homey.App }) {
    return (homey.app as MyApp).getStatus();
  },
};
```

Definer endepunktene i `.homeycompose/app.json` under `"api": {}`.

---

## 14. Homey-plattformens begrensninger (lær av McCallisterGuard)

| Hva du ønsker | Hvorfor det ikke går | Løsning |
|---|---|---|
| Spille video/lyd på Chromecast fra app-kode | Tredjepartsappers flow-actions er kun tilgjengelig via Flow-editoren | Fyr en trigger — bruk globale media-tokens som pills i brukerens flow |
| Starte en spesifikk flow programmatisk | Ingen `runFlow(id)` API for tredjepartsapper | Endre modus — la brukerens flow lytte på `mode_changed` |
| Generere flows automatisk fra kode | `homey:manager:api` gir kun `readonly` tilgang til flows | Dokumentér flowmønsteret i README — brukeren lager flowet manuelt |
| `setPath()` på Image-objektet | Finnes ikke i SDK v3 | Bruk `setStream()` med en callback som piper fildata |
| Push-notifikasjon med bilde | `notifications.createNotification` godtar kun tekst | Bruk `snapshot`-token i trigger + Pushover-appen i en flow |

---

## 15. Versjonering og publisering

```bash
homey app validate --level publish   # sjekk før publisering
homey app version patch              # 0.1.0 → 0.1.1
homey app version minor              # 0.1.0 → 0.2.0
homey app version major              # 0.1.0 → 1.0.0
homey app publish                    # laster opp til Athom (som Draft)
```

Gå til **https://tools.developer.homey.app** for å:
1. Publisere som **Test** (privat testlenke)
2. Sende inn til **sertifisering** (kreves for offentlig tilgang)

> Verified Developer-abonnement kreves **kun** for `"platforms": ["cloud"]`. For `"local"` (Homey Pro) er det ikke nødvendig.

---

## 16. Augment Agent Skills

Augment-agenten kan utvides med domene-spesifikke skills. For Homey-utvikling brukes `homey-app`-skillen fra GitHub.

**Installer skillen i prosjektet (én gang per prosjekt):**

```bash
npx skills add dvflw/homey-app-skill
```

Dette oppretter `skills-lock.json` i prosjektroten og laster ned `SKILL.md` til `.agents/skills/homey-app/`.

**`skills-lock.json` ser slik ut etter installasjon:**
```json
{
  "version": 1,
  "skills": {
    "homey-app": {
      "source": "dvflw/homey-app-skill",
      "sourceType": "github",
      "skillPath": "SKILL.md"
    }
  }
}
```

**Hva skillen gir deg:**
- Detaljerte referansefiler for SDK v3 mønstre (flow cards, drivers, devices, widgets, cloud vs local)
- Automatisk trigget av Augment når du spør om Homey-relaterte emner
- Oppdatert kunnskap om pairing, capabilities, discovery, OAuth2, mDNS/SSDP

**Oppdater en skill til siste versjon:**
```bash
npx skills update homey-app
```

> Sjekk inn `skills-lock.json` i Git — den sikrer at alle utviklere (og agenten) bruker samme skill-versjon.

---

## 17. Konvensjonelle commits

```
feat(flow): legg til ny trigger-kort
fix(camera): bytt setPath() med setStream()
docs(readme): oppdater floweksempler
chore(release): bump version til 0.2.0
remove(flow): fjern utdatert condition-kort
refactor(state): rydd opp i modus-logikk
```

---

## 18. README.txt — Homey App Store-krav

- **Kun ren tekst** — ingen Markdown, ingen URL-er, ingen overskrifter
- **Maks 1–2 avsnitt**, enkel linjeavstand, ingen unødvendig innrykk
- **Ingen punktlister med funksjoner** — beskriv alt i løpende tekst
- **Engasjerende og brukerfokusert** — forklar nytten i hverdagen, ikke tekniske detaljer
- Oversatte versjoner lagres som `README.no.txt`, `README.nl.txt` osv.

---

## 19. Sjekkliste før App Store-innsending

- [ ] `icon.svg` finnes i `assets/`
- [ ] `small.png`, `large.png`, `xlarge.png` finnes i `assets/images/`
- [ ] `brandColor` satt i `.homeycompose/app.json`
- [ ] `description.en` og `name.en` er satt
- [ ] `category` er satt (f.eks. `security`, `tools`, `lights`)
- [ ] `author.name` og `author.email` er satt
- [ ] `homey app validate --level publish` passerer uten feil
- [ ] Testet på ekte Homey Pro (ikke bare simulator)
- [ ] Alle tester grønne: `npx tsc --noEmit && npx vitest run`
