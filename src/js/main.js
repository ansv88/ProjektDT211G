"use strict";

import { apiKey } from "./apikey.js";

(g => { var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window; b = b[c] || (b[c] = {}); var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams, u = () => h || (h = new Promise(async (f, n) => { await (a = m.createElement("script")); e.set("libraries", [...r] + ""); for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]); e.set("callback", c + ".maps." + q); a.src = `https://maps.${c}apis.com/maps/api/js?` + e; d[q] = f; a.onerror = () => h = n(Error(p + " could not load.")); a.nonce = m.querySelector("script[nonce]")?.nonce || ""; m.head.append(a) })); d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)) })({
  key: apiKey,
  v: "weekly",
});

window.onload = initMap;

//Variabler
let map;
let marker;
let geocoder;

//Funktion som laddar Google Maps API och skapar kartan
async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");
  map = new Map(document.getElementById("map"), {
    zoom: 8,
    center: { lat: 59.3293, lng: 18.0686 },
    mapTypeControl: false,
  });

  //Skapa en geokoder-instans
  geocoder = new google.maps.Geocoder();

  //Anropa eventlisteners så att de säkert läggs till efter att kartan laddats
  addEventListeners();
}

//Funktion för att lägga till eventlisteners
function addEventListeners() {
  document.getElementById("addressForm").addEventListener("submit", formHandler, false);
  document.getElementById("clearButton").addEventListener("click", clearAll, false);
  document.getElementById("inputText").addEventListener("focus", clearAll, false);
}

//Funktion för att hantera submittad info från sökformuläret
function formHandler(event) {
  event.preventDefault(); //Förhindra formulärets standardbeteende (sidomladdning)
  geocode({ address: document.getElementById("inputText").value }); //Anropa geocode-funktionen
}

//Funktion för att rensa markör, textfält och artiklar med clear-knapp eller när användaren fokuserar på/klickar i textfältet
function clearAll() {
  if (marker) {
    marker.setMap(null);
    marker = null;
  }

  document.getElementById("inputText").value = "";
  document.getElementById("articleWrapper").innerHTML = "";
}

//Funktion som använder Google Maps Geocoding API för att omvandla en adress (från textfältet) till geografiska koordinater
function geocode(request) {
  geocoder.geocode(request)
    .then((result) => {
      const { results } = result;
      const searchResultsEl = document.getElementById("searchResults");
      searchResultsEl.innerHTML = ""; // Rensa tidigare sökresultat

      if (results.length === 1) { // Om det endast finns ett resultat, visa det direkt
        const location = results[0];
        const locationLatLng = location.geometry.location;
        handleResult(locationLatLng, location.formatted_address);

      } else { // Om det finns flera resultat, visa en lista för användaren att välja från
        results.forEach((location) => {
          const locationLatLng = location.geometry.location;
          const resultItem = document.createElement("div");
          resultItem.classList.add("result-item");
          resultItem.innerHTML = location.formatted_address;
          resultItem.addEventListener("click", () => handleResult(locationLatLng, location.formatted_address));
          searchResultsEl.appendChild(resultItem);
        });
      }
    })
    .catch((e) => {
      console.error("Geocode was not successful for the following reason: " + e);
    });
}

//Funktion för att hantera valt resultat från sökning
function handleResult(locationLatLng, address) {
  //Centrerar kartan på det valda resultatet och bestämmer zoomnivån
  map.setCenter(locationLatLng);
  map.setZoom(13);

  if (window.currentInfoWindow) window.currentInfoWindow.close();  //Kontrollerar om en tidigare InfoWindow finns och stänger den i så fall

  //Kontrollerar om det finns någon markör, om inte, skapa en ny
  if (!marker) {
    marker = new google.maps.Marker({
      map: map,
      title: address //Visar adressen vid hovrer över markör
    });
  }

  marker.setPosition(locationLatLng);  //Bestämmer position på markören

  //Skapar ett nytt InfoWindow och visar det vid markören
  const infoWindow = new google.maps.InfoWindow({
    content: address
  });
  infoWindow.open(map, marker);
  window.currentInfoWindow = infoWindow; //Uppdaterar referensen till det nuvarande InfoWindow

  //Rensar tidigare sökresultat och Wikipedia-artiklar
  document.getElementById("searchResults").innerHTML = "";
  document.getElementById("articleWrapper").innerHTML = "";

  //Anropar fetchGeoArticles med den valda platsens latitud och longitud för att hämta Wikipedia-artiklar
  fetchGeoArticles(locationLatLng.lat(), locationLatLng.lng());
}


//Funktion som anropar Wikipedia's Geosearch API för att hitta Wikipedia-artiklar relaterade till en specifik geografisk position.
async function fetchGeoArticles(lat, lon) {
  //Hämta datan genom koordinaterna, sökradie 10km och max 10 artiklar
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=10000&gslimit=10&format=json&origin=*`;

  //Fetch-anrop
  try {
    const response = await fetch(url);
    const data = await response.json();
    const articles = data.query.geosearch;

    //Loopa igenom artiklarna och skicka vidare artiklarna med deras pageid till fetchArticleDetails för att hämta mer detaljerad info
    for (const article of articles) {
      fetchArticleDetails(article.pageid);
    }
  } catch (error) {
    console.error('Error fetching geo articles:', error);
  }
}

//Funktion för att hämta mer detaljerad information om Wikipedia-artiklar 
async function fetchArticleDetails(pageId) {
  //Hämta datan genom pageId, artikelutdrag och ev thumbnail
  const detailUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&pageids=${pageId}&exintro&format=json&piprop=thumbnail&pithumbsize=200&origin=*`;

  //Fetch-anrop
  try {
    const response = await fetch(detailUrl);
    const data = await response.json();
    const page = data.query.pages[pageId];

    //Anropa ny funktion för visning av artiklarna
    displayArticles(page);
  } catch (error) {
    console.error('Error fetching article details:', error);
  }
}

//Funktion för att visa hämtade Wikipedia-artiklar
function displayArticles(article) {
  //Skapa DOM-element för att visa resultatet
  const articleWrapperEl = document.getElementById('articleWrapper');
  const articleEl = document.createElement('article');
  const articleImage = article.thumbnail ? `<img src="${article.thumbnail.source}" alt="${article.title}">` : '';

  //Dela utdraget i meningar och ta de tre första, om de finns
  const sentences = article.extract.split('. ');
  const firstThreeSentences = sentences.length > 3 ? sentences.slice(0, 3).join('. ') + '.' : sentences.join('. ');

  articleEl.innerHTML = `
        <h2>${article.title}</h2>
        ${articleImage}
        <p>${firstThreeSentences}</p>
        <a href="https://en.wikipedia.org/?curid=${article.pageid}" target="_blank">Läs mer</a>
    `;
  articleWrapperEl.appendChild(articleEl);
}