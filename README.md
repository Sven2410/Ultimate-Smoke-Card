# Ultimate Smoke Card

Compacte Lovelace-kaart voor Home Assistant om rookmelders te monitoren. Toont status, temperatuur en batterijpercentage in één compacte balk. Bij rookdetectie activeert een pulserende rode alarm-animatie.

---

## Functies

- Rookstatus met kleurcodering (groen = veilig, rood = alarm)
- Pulserende alarm-animatie bij rookdetectie
- Temperatuur weergave (optioneel)
- Batterijindicator met kleur op basis van niveau (optioneel)
- Ingebouwde visuele editor — geen YAML nodig
- Klik op de kaart opent de more-info van de rookmelder

---

## Installatie via HACS

1. Ga in Home Assistant naar **HACS → Frontend**
2. Klik op de **drie puntjes** (rechtsboven) → **Aangepaste repositories**
3. Vul in:
   - **Repository:** `https://github.com/Sven2410/ultimate-smoke-card`
   - **Categorie:** Lovelace
4. Klik **Toevoegen**
5. Zoek **Ultimate Smoke Card** en klik **Installeren**
6. Herstart de frontend (F5 of cache leegmaken)

---

## Gebruik

Voeg de kaart toe via de dashboard-editor — de visuele editor laat je alle entities selecteren zonder YAML.

Of handmatig via YAML:

```yaml
type: custom:ultimate-smoke-card
name: Woonkamer
smoke: binary_sensor.rookmelder_woonkamer_smoke
temperature: sensor.rookmelder_woonkamer_temperature
battery: sensor.rookmelder_woonkamer_battery
```

### Opties

| Optie         | Verplicht | Omschrijving                            |
|---------------|-----------|-----------------------------------------|
| `name`        | Nee       | Naam van de locatie (bijv. Woonkamer)   |
| `smoke`       | **Ja**    | binary_sensor entity van de rookmelder  |
| `temperature` | Nee       | sensor entity voor temperatuur          |
| `battery`     | Nee       | sensor entity voor batterijpercentage   |

---

## Batterijkleuren

| Niveau  | Kleur  |
|---------|--------|
| > 60%   | Groen  |
| 31–60%  | Geel   |
| 16–30%  | Oranje |
| ≤ 15%   | Rood   |

---

## Licentie

MIT
