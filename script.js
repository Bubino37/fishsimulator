let levelsData = null; // Globálna premenná pre údaje o úrovni
let playerData = null; // Globálna premenná pre údaje hráča
let keyDownTimer; // Timer for keydown event
let fishCatchTimer; // Timer for catching fish
let catchTime; // This will be a random time between 10 and 30 seconds
let isCastingEnabled = true; // Global variable to manage casting state
let isGamePaused = false;
let timerStart = null; // Start time of the fish catch timer
let remainingCatchTime = null;
const marker = document.getElementById('fishingMarker');
let markerX = defaultMarkerPosition(); // Initial X position
let markerY = defaultMarkerPosition(); // Initial Y position
const fish = document.getElementById('fish');
let fishX;
let fishY;
const throwButton = document.getElementById('throwButton');
let ismobile = false;


function defaultMarkerPosition() {
  return document.getElementById('gameArea').offsetWidth / 2;
}
// Načítanie hráčových údajov
async function getPlayerData() {
  try {
      const response = await fetch('./data.json');
      const data = await response.json();
      return data;
  } catch (error) {
      console.error("Chyba pri načítaní hráčových dát:", error);
  }
}

async function loadPlayerData() {
  try {
      const response = await fetch('./data.json');
      const data = await response.json();
      playerData = data;

      // Uistite sa, že purchasedLevels je vždy inicializované ako pole
      if (!playerData.purchasedLevels) {
          playerData.purchasedLevels = [];
      }
  } catch (error) {
      console.error("Chyba pri načítaní hráčových dát:", error);
  }
}
// Aktualizácia hráčových údajov
async function updatePlayerData(newData) {
  playerData = newData; // Updates data in the playerData variable
  
  document.getElementById('levelInfo').textContent = playerData.level;
  document.getElementById('moneyInfo').textContent = playerData.money;

  savePlayerData(); // Uloženie aktualizovaných údajov hráča
}

// Uloženie hráčových dát do localStorage
function savePlayerData() {
  if(playerData) {
    localStorage.setItem('playerData', JSON.stringify(playerData));
  }
}

// Načítanie hráčových dát z localStorage
function loadSavedPlayerData() {
  const savedData = localStorage.getItem('playerData');
  if (savedData) {
      let parsedData = JSON.parse(savedData);
      
      // Kontrola dát (napr. či obsahujú všetky potrebné vlastnosti)
      if (isValidData(parsedData)) {
          return parsedData;
      }
  }
  return null; // Alebo vrátiť predvolené hodnoty, ak sú údaje nesprávne
}
function isValidData(data) {
  // Implementujte vlastné kontroly
  return data && data.purchasedLevels && Array.isArray(data.purchasedLevels);
}

function showMenu() {
  pauseGame(); // Pozastavi hru
  document.getElementById('menu').style.display = 'flex';
}

// Funkcia na skrytie menu
function hideMenu() {
  document.getElementById('menu').style.display = 'none';
}

function showGameControlsModal() {
  document.getElementById('gameControlsModal').style.display = 'block';
}

function hideGameControlsModal() {
  document.getElementById('gameControlsModal').style.display = 'none';
}

window.onclick = function(event) {
  if (event.target === document.getElementById('gameControlsModal')) {
    hideGameControlsModal();
  }
};

function generateFish() {
  // Coords for inner square
  const min = document.getElementById('gameArea').offsetWidth / 3;
  const max = document.getElementById('gameArea').offsetWidth - min;

  fishX = Math.floor(Math.random() * (max - min + 1)) + min; // Random x-coordinate
  fishY = Math.floor(Math.random() * (max - min + 1)) + min; // Random y-coordinate

  const fish = document.getElementById('fish');
    const levelInfo = levelsData.find(level => level.level === playerData.level);
    if(levelInfo) {
        fish.style.backgroundImage = `url('./img/${levelInfo["ryba-druh"]}.png')`;
        console.log(`url('./img/${levelInfo["ryba-druh"]}.png')`);
        fish.style.backgroundSize = 'cover'; // Uistite sa, že obrázok pokryje celý div
        fish.style.width = '30px';
        fish.style.height = '30px';
    }
  fish.style.left = fishX + 'px';
  fish.style.top = fishY + 'px';
  fish.style.display = 'block';
}

function fishIsInMarker() {
  return (Math.abs(fishX - markerX) < 30 && Math.abs(fishY - markerY) < 30);
}
async function catchFish() {
  clearTimeout(fishCatchTimer); // Stop the timer as fish is caught
  remainingCatchTime = null; // Reset remaining time
    timerStart = null; // Reset timer start
  
    if (!fishIsInMarker()) {
      console.log('Netrafil si rybu');
      updateStatusInfo('Netrafil si rybu! Hádž znovu.');
      return;
  }
  console.log('Chytil si rybu');
  updateStatusInfo('Chytil si rybu! Môžeš znovu hádzať.');
  const currentLevel = playerData.level;
  const levelInfo = levelsData.find(level => level.level === playerData.level);
    if (levelInfo) {
        const newFish = {
            species: levelInfo["ryba-druh"],
            value: levelInfo.cena
        };
      let fishIndex = playerData.inventory.findIndex(fish => fish.species === newFish.species);
      if (fishIndex !== -1) {
          playerData.inventory[fishIndex].value += newFish.value;
      } else {
          playerData.inventory.push(newFish);
      }
      isCastingEnabled = true;
      await updatePlayerData(playerData);
      const fish = document.getElementById('fish');
        fish.style.backgroundImage = `url('./img/${newFish.species}.png')`;
        fish.style.width = '30px';
        fish.style.height = '30px';
  }
}

function updateStatusInfo(statusText) {
  document.getElementById('statusInfo').textContent = statusText;
}

// Reset hráčových údajov
async function resetPlayerData() {
  localStorage.removeItem('playerData'); // Odstránenie údajov o hráčovi
  console.log(localStorage);
  try {
      // Fetch initial player data from the database or file
      const initialData = await getPlayerData();
      await updatePlayerData(initialData);
      console.log("Player data has been reset to initial values.");
  } catch (error) {
      console.error("Error resetting player data:", error);
  }
}
// Načítanie údajov o úrovni
async function loadLevelsData() {
  try {
    const response = await fetch('./level.json');
    levelsData = await response.json();
    setLevelBackground(levelsData[0]); // Nastavíme defaultne na prvú úroveň, alebo podľa hráčových údajov
 
  } catch (error) {
    console.error("Chyba pri načítaní údajov o úrovni:", error);
  }
}

function prepareToCatchFish() {
  if (isCastingEnabled) {
    console.log("Udica sa hodila!");
    updateStatusInfo("Udica sa hodila!");
    isCastingEnabled = false;
    generateFish();

    // Show the fishing alert
    marker.style.display = 'block';

    catchTime = Math.floor(Math.random() * (30000 - 10000 + 1) + 10000);
    timerStart = new Date().getTime(); // Set the start time for the timer
    fishCatchTimer = setTimeout(showCatchButton, catchTime);
  }
}
function setLevelBackground(levelData) {
    const gameArea = document.getElementById("gameArea");
    if(gameArea && levelData.image) {
      gameArea.style.backgroundImage = `url('./${levelData.image}')`;
    }
  }

  function showProgressBar() {
    document.getElementById('holdProgressContainer').style.display = 'block';
  }
  
  function hideProgressBar() {
    document.getElementById('holdProgressContainer').style.display = 'none';
  }
  
  function updateProgressBar(percentage) {
    document.getElementById('holdProgress').value = percentage;
  }

// // Pohyb mieritka po obrazovke
// const marker = document.getElementById('fishingMarker');
// let markerX = 507; // Initial X position
// let markerY = 507; // Initial Y position

function updateMarkerPosition() {
  const boundaryMax = document.getElementById('gameArea').offsetWidth - 15;


    if (markerX < 15) markerX = 15;
    if (markerX > boundaryMax) markerX = boundaryMax;

    if (markerY < 15) markerY = 15;
    if (markerY > boundaryMax) markerY = boundaryMax;
    // if (isCastingEnabled) {
    //   console.log(markerX, markerY);
    // }
    

    marker.style.left = markerX + 'px';
    marker.style.top = markerY + 'px';
}


// Klávesový vstup pre počítače
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(event) {
    const step = 10;
    if (event.key === " " && isCastingEnabled) {
      // Vycentrovanie markeru
      markerX = defaultMarkerPosition();
      markerY = defaultMarkerPosition();
        // Zobrazit progress bar
        showProgressBar();
        // updateProgressBar(0); // Začít na 0%
        let startTime = Date.now(); // Uložit počáteční čas

        // Aktualizovat progress bar každých 50 milisekund
        let interval = setInterval(() => {
            let elapsedTime = Date.now() - startTime; // Zjistit uplynulý čas
            let percentage = Math.min((elapsedTime / 5000) * 100, 100); // Vypočítat procento
            updateProgressBar(percentage); // Aktualizovat progres bar
            if (percentage >= 100) {
                clearInterval(interval); // Zastavit aktualizace po dosažení 100%
            }
        }, 50); // Aktualizovat 20x za sekundu

        // Nastavit odpočítávání na 5 sekund pro zavolání funkce prepareToCatchFish
        keyDownTimer = setTimeout(() => {
            prepareToCatchFish(); // Tato funkce se zavolá po 5 sekundách držení klávesy W
            clearInterval(interval); // Zastavit aktualizace progressbaru
            hideProgressBar(); // Skrýt progres bar
        }, 5000);
    } else if (event.keyCode === 37 && !isCastingEnabled) {  // stlacena lava sipka
        markerX -= step;
    } else if (event.keyCode === 38 && !isCastingEnabled) {  // stlacena horna sipka
        markerY -= step;
    } else if (event.keyCode === 39 && !isCastingEnabled) {  // stlacena prava sipka
        markerX += step;
    } else if (event.keyCode === 40 && !isCastingEnabled) {  // stlacena spodna sipka
        markerY += step;
    }

    updateMarkerPosition();
}

function handleOrientation(event) {
  const gameArea = document.getElementById("gameArea");
  const marker = document.getElementById("fishingMarker");

  // Rozmery gameArea
  const maxX = gameArea.clientWidth - marker.clientWidth;
  const maxY = gameArea.clientHeight - marker.clientHeight;

  // Vypočet uhlov
  let x = event.beta;  // V ose X: hodnota medzi -180 a 180
  let y = event.gamma; // V ose Y: hodnota medzi -90 a 90

  // Konverzia hodnôt na percentuálne rozmedzie pre hernú oblasť
  let percentX = (y + 90) / 180; // od 0 do 1
  let percentY = (x + 90) / 180; // od 0 do 1

  // Výpočet novej pozície markeru
  let posX = percentX * maxX;
  let posY = percentY * maxY;

  // Aplikácia ohraničenia pre marker
  posX = Math.max(15, Math.min(maxX - 15, posX));
  posY = Math.max(15, Math.min(maxY - 15, posY));

  // Aktualizácia polohy markeru
  marker.style.left = posX + 'px';
  marker.style.top = posY + 'px';

  markerX = posX;
  markerY = posY;

  // Debugovanie: vypíšte hodnoty pre porovnanie
  console.log(`Marker X: ${posX}, Marker Y: ${posY}`);
  console.log(`Fish X: ${fishX}, Fish Y: ${fishY}`);
}

// Pridanie počúvača udalostí pre zmenu orientácie
if (window.DeviceOrientationEvent) {
  window.addEventListener("deviceorientation", handleOrientation, true);
}

document.addEventListener('keyup', (event) => {
  if (event.key === " ") {
    clearInterval(keyDownTimer); // Zrušit interval při puštění klávesy
    hideProgressBar(); // Skrýt progress bar
  }
});
// Gyroskop pre mobily
// window.addEventListener('deviceorientation', (event) => {
//   let beta = event.beta; // Beta je rotácia okolo osi X, ktorá meria náklon hore a dole.
//   if(beta < 45 && isCastingEnabled){ // Displej je naklonený nahor
//     // showCastButton();
//     showCatchButton();
//     isCastingEnabled = false; // Zastaviť detekciu naklonenia kým sa neklikne na tlačidlo
//   }
// });
function showCastButton() {
  const castButton = document.getElementById("castButton");
  if (castButton) {
    castButton.style.display = "block"; // Zobrazí tlačidlo
  }
}

function throwRod() {
  if (isCastingEnabled) {
      prepareToCatchFish();
      // Skryte tlačidlo na hodenie prútu
      throwButton.style.display = 'none';
  }
}

function populateShop() {
  const shopTable = document.getElementById('shopTable').getElementsByTagName('tbody')[0];
  shopTable.innerHTML = ''; // Clear existing items

  levelsData.forEach(level => {
      let row = shopTable.insertRow();
      let levelCell = row.insertCell(0);
      let priceCell = row.insertCell(1);
      let actionCell = row.insertCell(2);

      levelCell.textContent = level.info;
      priceCell.textContent = level.requiredExperience + " $";

      let actionButton = document.createElement('button');
      console.log(levelsData);
      actionButton.textContent = playerData.purchasedLevels.includes(level.level) ? 'Prepnúť' : 'Kúpiť';
      actionButton.classList.add("waves-effect", "waves-light", "btn-small");
      actionButton.disabled = playerData.level === level.level;
      actionButton.onclick = () => {
          if (playerData.purchasedLevels.includes(level.level)) {
              switchLevel(level);
          } else {
              buyLevel(level);
          }
      };
      actionCell.appendChild(actionButton);
  });
}
function buyLevel(level) {
  if(playerData.money >= level.requiredExperience && !playerData.purchasedLevels.includes(level.level)) {
      playerData.money -= level.requiredExperience; // Subtract the cost
      playerData.level = level.level; // Update player's level
      playerData.purchasedLevels.push(level.level); // Mark level as purchased

      setLevelBackground(level); // Update background
      console.log(playerData);
      updatePlayerData(playerData); // Update display and data

      populateShop(); // Refresh the shop display
      console.log(`Level ${level.info} zakúpený!`);
      updateStatusInfo(`Level ${level.info} zakúpený!`);
      toggleShop();
  } else {
      console.log("Nedostatočné finančné prostriedky alebo úroveň už bola zakúpená!");
  }
}

function switchLevel(level) {
  if (playerData.purchasedLevels.includes(level.level)) {
      playerData.level = level.level; // Switch to the new level
      setLevelBackground(level); // Update background
      updatePlayerData(playerData); // Update display and data
      console.log(`Prepnuté na level ${level.info}.`);
      updateStatusInfo(`Prepnuté na level ${level.info}.`);
      toggleShop();
  } else {
      console.log("Úroveň ešte nebola zakúpená!");
      updateStatusInfo("Úroveň ešte nebola zakúpená!");
  }
}

function toggleShop() {
  let shopModal = document.getElementById('shopModal');
  if(shopModal.style.display === 'none') {
      pauseGame(); // Pause the game when the shop is opened
      shopModal.style.display = 'block';
      populateShop(); // Populate the shop with items when opened
  } else {
      resumeGame(); // Resume the game when the shop is closed
      shopModal.style.display = 'none';
  }
}

function toggleMenu() {
  if (document.getElementById('menu').style.display === 'flex') {
      resumeGame();
      document.getElementById('menu').style.display = 'none';
  } else {
      showMenu();
  }
}

function toggleInventory() {
  let inventoryModal = document.getElementById('inventoryModal');
  if(inventoryModal.style.display === 'none') {
      pauseGame(); // Pause the game when the inventory is opened
      populateInventory();
      inventoryModal.style.display = 'block';
  } else {
      resumeGame(); // Resume the game when the inventory is closed
      inventoryModal.style.display = 'none';
  }
}

function populateInventory() {
  const inventoryTable = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
  inventoryTable.innerHTML = ''; // Clear existing items

  playerData.inventory.forEach((item, index) => {
    let row = inventoryTable.insertRow();
    let nameCell = row.insertCell(0);
    let valueCell = row.insertCell(1);
    let actionCell = row.insertCell(2);

    nameCell.textContent = item.species;
    valueCell.textContent = item.value + " $";

    let sellButton = document.createElement('button');
    sellButton.textContent = 'Predať';
    sellButton.classList.add("waves-effect");
    sellButton.classList.add("waves-light");
    sellButton.classList.add("btn-small");
    sellButton.onclick = () => sellItem(index);
    actionCell.appendChild(sellButton);
  });
}

function sellItem(index) {
  let item = playerData.inventory[index];
  playerData.money += item.value; // Přidat cenu položky k penězům
  playerData.inventory.splice(index, 1); // Odebrat položku z inventáře
  updatePlayerData(playerData); // Aktualizovat data a UI
  populateInventory(); // Obnovit zobrazení inventáře
}

function showCatchButton() {
  if (!isGamePaused) {
    const throwButton = document.getElementById("throwButton");
    const castButton = document.getElementById("castButton");
    if (castButton) {
      castButton.style.display = "block"; // Show the button to catch the fish

      // Hide the fishing alert
      marker.style.display = 'none';
      fish.style.display = 'none';

      fishCatchTimer = setTimeout(() => {
        if (!isGamePaused) {
          castButton.style.display = "none";
          if (ismobile) {
            throwButton.style.display = 'block';
          }
          
          console.log("Ryba ušla!");
          updateStatusInfo("Ryba ušla!");
          // throwButton.style.display = 'block';
          isCastingEnabled = true;

          // Reset the timer and alert states
          remainingCatchTime = null;
          timerStart = null;
        }
      }, 3000);
    }
    
  }
}
function castLine() {
  const castButton = document.getElementById("castButton");
  if (castButton) {
    castButton.style.display = "none"; // Skryje tlačidlo
  }
  isCastingEnabled = true; // Enable casting again
  if(ismobile){
    throwButton.style.display = 'block';
  }
  

  // Vygenerovanie náhodného času (v milisekundách) medzi 10 a 30 sekundami
  catchTime = (Math.random() * (30000 - 10000) + 10000).toFixed(0);
  console.log(catchTime);
  // Po uplynutí náhodného času sa zobrazí tlačidlo na chytenie ryby na 3 sekundy
  // fishCatchTimer = setTimeout(showCatchButton, catchTime);
  
}

function pauseGame() {
  console.log("Hra je zastavená.");
  updateStatusInfo("Hra je zastavená.");
  if (fishCatchTimer) {
      clearTimeout(fishCatchTimer); // Clears the existing fish catch timer
      // Calculate remaining time for catch if the timer was running
      if (timerStart) {
          remainingCatchTime = catchTime - (new Date().getTime() - timerStart);
      }
  }
  isGamePaused = true;
}
function resumeGame() {
  console.log("Hra pokračuje.");
  updateStatusInfo("Hra pokračuje.");
    if (remainingCatchTime && remainingCatchTime > 0) {
        fishCatchTimer = setTimeout(showCatchButton, remainingCatchTime);
        timerStart = new Date().getTime(); // Reset the start time for the timer
    }
    isGamePaused = false;
}
async function startGame() {
  hideMenu(); // Hide the menu
  resumeGame(); // Resume the game from where it was paused
  
  // Enable casting again
  isCastingEnabled = true;
  
  // Ensure the game area is displayed
  document.getElementById('gameArea').style.display = 'block';

  // Use the currently loaded player data to set the background
  const levelInfo = levelsData.find(level => level.level === playerData.level);
  if(levelInfo) {
    setLevelBackground(levelInfo); // Set the background based on the current level of the player
  } else {
    console.error("No level information found for the current level.");
    // Optionally, handle the error case, such as setting a default background or notifying the user.
  }
}

function adjustThrowButtonVisibility() {
  if (window.innerWidth <= 768) { // Detekcia mobilného zariadenia
      throwButton.style.display = 'block';
      ismobile = true;
  } else {
      throwButton.style.display = 'none';
      ismobile = false;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  
  const playButton = document.querySelector("#menu button:nth-child(1)"); // Assuming the first button is 'Play'
  playButton.addEventListener('click', startGame);

  const castButton = document.getElementById("castButton"); // Assuming castButton is the ID for the fishing button
  if (castButton) {
    castButton.addEventListener('click', catchFish); // Adds event for clicking the cast button
    castButton.style.display = "none"; // Hides the button at the start
  }
});
async function initGame() {
  await loadLevelsData();
  
  // Skúsi načítať dáta hráča z localStorage, ak sú dostupné
  const savedPlayerData = loadSavedPlayerData();
  if(savedPlayerData) {
    playerData = savedPlayerData;
  } else {
    await loadPlayerData(); // Načítanie nových dát hráča, ak nie sú žiadne uložené
  }
  adjustThrowButtonVisibility();

  // Vygeneruj náhodný level od 1 do 5
  const randomLevel = Math.floor(Math.random() * 5) + 1;  // Náhodné číslo medzi 1 a 5

  // Nastav náhodný level pre hráča, ale iba ak úroveň existuje v dátach úrovne
  if(levelsData.some(level => level.level === randomLevel)) {
    playerData.level = randomLevel;
  }

  updatePlayerData(playerData); // Aktualizuj údaje hráča s novým levelom
  showMenu(); // Shows menu at the start

  // Získaj informácie o úrovni pre aktuálne nastavený level a nastav pozadie
  const levelInfo = levelsData.find(level => level.level === playerData.level);
  if(levelInfo) {
    setLevelBackground(levelInfo);
  } else {
    console.error("No level information found for the current level.");
    // Optionally, handle the error case, such as setting a default background or notifying the user.
  }

  console.log(playerData);
  console.log(levelsData); // Zobraziť údaje o úrovni
    // displayPlayerData(playerData);
    const castButton = document.getElementById("castButton");
    document.getElementById('throwButton').addEventListener('click', throwRod);
    if (castButton) {
      castButton.addEventListener('click', castLine); // Pridáva udalosť pre kliknutie
      castButton.style.display = "none"; // Skryje tlačidlo na začiatku
    }
    window.addEventListener('load', adjustThrowButtonVisibility);
window.addEventListener('resize', adjustThrowButtonVisibility);
// document.getElementById('resetButton').addEventListener('click', resetPlayerData);
if (window.DeviceOrientationEvent) {
  window.addEventListener("deviceorientation", handleOrientation, true);
}
}
  
initGame();