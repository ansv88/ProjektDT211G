## Kartwiki-applikation
Denna webbapplikation är gjord som en projektuppgift i kursen DT211G Fronend-baserad webbutveckling som ges på Mittuniversitetet.
Med applikationen kan man söka på en plats eller adress och sedan få upp närliggande intressanta platser med Wikipedia-artiklar relaterade till dessa.

### Funktioner
Sökfunktion: Ange en adress eller ett platsnamn i sökfältet för att få upp den på en karta och även se intressanta platser inom en radie av 5 km.
Wikipedia-integration: För varje plats som du söker på, kommer applikationen att hämta och visa relevanta Wikipedia-artiklar om området.
Responsiv design: Applikationen är designad för att fungera smidigt på både stationära och mobila enheter.
Användarvänlig interaktion: Tydliga instruktioner, feedback och enkla navigeringsalternativ gör applikationen lättanvänd.

### Tekniska Detaljer
HTML5 och SCSS(CSS3): Grunden för applikationens struktur och design.
JavaScript (ES6): Logik och interaktivitet i frontend.
Google Maps API: För kartvisningar och geokodning.
Wikipedia API: För att hämta information/artiklar om områden baserade på geografisk data.

## Uppbyggnad och utvecklingsmiljö
Applikationen är byggd med HTML, CSS (SCSS), JavaScript samt med npm-paketet Parcel.

1. Till att börja med behöver Node.js vara installerat. Hämtas från extern webbplats.
2. Sedan för att köra applikationen lokalt, så klona först ned projektet till datorn.
3. Skriv in 'npm install' i kommandotolken/terminalen för att installera npm-paketet Parcel utifrån package.json-filen.
4. Starta en lokal server och öppna applikationen i en webbläsare genom att skriva 'npm run start'.
5. Skriv in en adress i sökfältet och klicka på "Sök"-knappen för att börja utforska.
6. Använd "Rensa"-knappen för att rensa alla nuvarande markörer och sökningar.

OBS! Google Maps API kräver API-nyckel. Detta är ett betal-API som kräver registrering på Google Cloud. Finns provperiod att prova i 90 dagar.