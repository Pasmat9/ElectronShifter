# Plánovač směn (Shift Planner)

Desktopová aplikace postavená na platformě **Electron** pro efektivní plánování, evidenci a tisk měsíčních pracovních směn zaměstnanců.

## 🚀 Hlavní funkce

*   **Dynamický kalendář**: Automatické generování dnů v měsíci a automatické barevné zvýraznění víkendů a státních svátků.
*   **Chytrá správa hodin**: Evidence hodinového fondu, automatický výpočet odpracovaných hodin v daném měsíci a automatický převod zůstatku do dalšího měsíce.
*   **Generátor směn**: Rychlé automatické nasazení ranních, denních a nočních směn na základě nastavených parametrů pro pracovní dny i víkendy.
*   **Trvalé ukládání**: Automatické ukládání dat a načítání historie přechozích měsíců z lokálního úložiště + možnost exportu/inportu z JSON souboru.
*   **Tisk a PDF náhled**: Možnost vygenerovat přesný tiskový arch formátu A4 na šířku (Landscape) nebo zobrazit uživatelský náhled před samotným tiskem.

## 🛠️ Použité technologie

*   **Electron** (Desktop runtime environment)
*   **JavaScript** (Vanilla ES6+ pro logiku a IPC komunikaci)
*   **HTML5 & CSS3** (Moderní UI, Flexbox, Sticky layout a tiskové @media print styly)

## 💻 Lokální spuštění

Pro spuštění aplikace v režimu vývojáře potřebuješ mít nainstalovaný **Node.js**.

1. **Naklonuj si tento repozitář:**
   ```bash
   git clone https://github.com
   cd NÁZEV-REPOZITÁŘE
   ```

2. **Nainstaluj potřebné závislosti (dependencies):**
   ```bash
   npm install
   ```

3. **Spusť aplikaci:**
   ```bash
   npm start
   ```

## 📂 Struktura projektu

```text
├── main.js             # Hlavní proces Electronu (správa oken, generování PDF)
├── package.json        # Konfigurace projektu, skripty a závislosti
├── index.html          # Hlavní uživatelské rozhraní (struktura tabulky a lišty)
├── src/
│   ├── styles.css      # Kompletní stylování aplikace, sticky prvků a tisku
│   └── script.js       # Logika tabulky (výpočty, localStorage, vyhledávání dat)
│   └── preLoad.js      # Slouží k přemostění mezi hlavním (main.js) a render procesem (script.js)
└── temp_nahled.pdf     # Dočasný soubor generovaný pro náhled tisku (automaticky se maže)
```

## 📋 Plánované funkce (Todo)

- [ ] Export rozpisů do formátu Microsoft Excel (.xlsx).
- 


## 📄 Licence

Tento projekt je licencován pod licencí MIT.
