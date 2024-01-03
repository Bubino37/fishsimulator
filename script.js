let levelsData = null; // Globálna premenná pre údaje o úrovni
let playerData = null; // Globálna premenná pre údaje hráča
let keyDownTimer; // Timer for keydown event
let fishCatchTimer; // Timer for catching fish
let catchTime; // This will be a random time between 10 and 30 seconds
let isCastingEnabled = true; // Global variable to manage casting state
let isGamePaused = false;
let timerStart = null; // Start time of the fish catch timer
let remainingCatchTime = null;


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
  playerData = await getPlayerData(); // Load data
  if (!playerData.purchasedLevels) {
      playerData.purchasedLevels = []; // Initialize if not present
  }
  displayPlayerData(playerData);
}
// Aktualizácia hráčových údajov
async function updatePlayerData(newData) {
  playerData = newData; // Updates data in the playerData variable
  displayPlayerData(playerData); // Displays updated data
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
async function catchFish() {
  clearTimeout(fishCatchTimer); // Stop the timer as fish is caught
  remainingCatchTime = null; // Reset remaining time
    timerStart = null; // Reset timer start
  const currentLevel = playerData.level;
  const levelInfo = levelsData.find(level => level.level === currentLevel);

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
  }
}

// Zobrazenie hráčových údajov
function displayPlayerData(data) {
  document.getElementById('playerData').innerHTML = '';
  document.getElementById('playerInventory').innerHTML = '';

  for (const key in data) {
    if (Array.isArray(data[key])) {
      const container = document.getElementById('playerInventory');

      data[key].forEach(item => {
        const keyItem = document.createElement('div');
        keyItem.classList.add('item');
        keyItem.textContent = `${item.species}: `;
        container.appendChild(keyItem);

        const valueItem = document.createElement('div');
        valueItem.classList.add('item');
        valueItem.textContent = `${item.value}`;
        container.appendChild(valueItem);
      });

    } else {
      const container = document.getElementById('playerData');

      const keyItem = document.createElement('div');
      keyItem.classList.add('item');
      keyItem.textContent = `${key}: `;
      container.appendChild(keyItem);

      const valueItem = document.createElement('div');
      valueItem.classList.add('item');
      valueItem.textContent = `${data[key]}`;
      container.appendChild(valueItem);
    }
  }
}

// Reset hráčových údajov
async function resetPlayerData() {
  const defaultData = {
    "money": 1000,
    "inventory": [],
    "level": 1
  };
  await updatePlayerData(defaultData);
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
  isCastingEnabled = false;

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
// Klávesový vstup pre počítače
document.addEventListener('keydown', (event) => {
  if ((event.key === "w" || event.key === "W") && isCastingEnabled) {
    keyDownTimer = setTimeout(prepareToCatchFish, 5000); // 5 second keydown to cast line
    
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === "w" || event.key === "W") {
    clearTimeout(keyDownTimer); // Cancel the countdown if key is released early
  }
});
// Gyroskop pre mobily
window.addEventListener('deviceorientation', (event) => {
  let beta = event.beta; // Beta je rotácia okolo osi X, ktorá meria náklon hore a dole.
  if(beta < 45 && isCastingEnabled){ // Displej je naklonený nahor
    // showCastButton();
    showCatchButton();
    isCastingEnabled = false; // Zastaviť detekciu naklonenia kým sa neklikne na tlačidlo
  }
});
function showCastButton() {
  const castButton = document.getElementById("castButton");
  if (castButton) {
    castButton.style.display = "block"; // Zobrazí tlačidlo
  }
}
function populateShop() {
  const shopItems = document.getElementById('shopItems');
  shopItems.innerHTML = ''; // Clear existing items

  levelsData.forEach(level => {
      let li = document.createElement('li');
      li.textContent = `${level.info.charAt(0).toUpperCase() + level.info.slice(1)} - Cena: ${level.requiredExperience} skúsenostných bodov`;

      let actionButton = document.createElement('button');
      if (playerData.purchasedLevels.includes(level.level)) {
          if(playerData.level === level.level){
              actionButton.textContent = 'Aktuálny';
              actionButton.disabled = true;
          } else {
              actionButton.textContent = 'Prepnúť';
              actionButton.onclick = function() { switchLevel(level); };
          }
      } else {
          actionButton.textContent = 'Kúpiť';
          actionButton.onclick = function() { buyLevel(level); };
      }
      li.appendChild(actionButton);
      shopItems.appendChild(li);
  });
}
function buyLevel(level) {
  if(playerData.money >= level.requiredExperience && !playerData.purchasedLevels.includes(level.level)) {
      playerData.money -= level.requiredExperience; // Subtract the cost
      playerData.level = level.level; // Update player's level
      playerData.purchasedLevels.push(level.level); // Mark level as purchased

      setLevelBackground(level); // Update background
      updatePlayerData(playerData); // Update display and data

      populateShop(); // Refresh the shop display
      console.log(`${level.info} zakúpený!`);
  } else {
      console.log("Nedostatočné finančné prostriedky alebo úroveň už bola zakúpená!");
  }
}

function switchLevel(level) {
  if (playerData.purchasedLevels.includes(level.level)) {
      playerData.level = level.level; // Switch to the new level
      setLevelBackground(level); // Update background
      updatePlayerData(playerData); // Update display and data
      console.log(`Prepnuté na ${level.info}.`);
  } else {
      console.log("Úroveň ešte nebola zakúpená!");
  }
}

function toggleShop() {
  let shopModal = document.getElementById('shopModal');
  if(shopModal.style.display === 'none') {
      shopModal.style.display = 'block';
      populateShop(); // Populate the shop with items when opened
  } else {
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
function showCatchButton() {
  if (!isGamePaused) {
      const castButton = document.getElementById("castButton");
      if (castButton) {
          castButton.style.display = "block"; // Zobrazí tlačidlo na chytenie ryby
          console.log("Môžeš chytiť rybu!");

          fishCatchTimer = setTimeout(() => {
              if (!isGamePaused) { // Check if game is not paused
                  castButton.style.display = "none";
                  console.log("Ryba ušla!");
                  isCastingEnabled = true; // Umožní opätovné hodenie udice
                  remainingCatchTime = null; // Reset remaining time
                  timerStart = null; // Reset timer start
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

  // Vygenerovanie náhodného času (v milisekundách) medzi 10 a 30 sekundami
  catchTime = (Math.random() * (30000 - 10000) + 10000).toFixed(0);
  console.log(catchTime);
  // Po uplynutí náhodného času sa zobrazí tlačidlo na chytenie ryby na 3 sekundy
  // fishCatchTimer = setTimeout(showCatchButton, catchTime);
  
}

function pauseGame() {
  console.log("Hra je zastavena.");
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
  console.log("Hra pokracuje.");
    if (remainingCatchTime && remainingCatchTime > 0) {
        fishCatchTimer = setTimeout(showCatchButton, remainingCatchTime);
        timerStart = new Date().getTime(); // Reset the start time for the timer
    }
    isGamePaused = false;
}
async function startGame() {
  hideMenu();
    resumeGame();  // Pridané na obnovenie hry
  // Príprava herného prostredia
  // Tu môžete napríklad resetovať skóre, nastaviť alebo skryť/vykresliť herné prvky, prípadne načítať herné úrovne
  // Tu by ste tiež mali obnoviť príznak, aby sa umožnilo hodenie udice
  isCastingEnabled = true;
  
  // Ak máte nejaké ďalšie prvky alebo údaje, ktoré treba aktualizovať alebo zobraziť
  // Napríklad resetovanie času, zobrazenie hráčovej pozície, atď.
  
  // Zobrazenie herného prostredia, napr. gameArea ak ste ho mali skrytý
  document.getElementById('gameArea').style.display = 'block';

  // Nastavenie príslušného pozadia alebo herných prvkov podľa úrovne
  const playerData = await getPlayerData(); // Načítanie údajov o hráčovi
  const levelInfo = levelsData.find(level => level.level === playerData.level);
  if(levelInfo) {
    setLevelBackground(levelInfo);
  }

  // Ak máte v hre hudbu alebo zvukové efekty, tu by ste ich mohli spustiť alebo reštartovať
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
  await loadPlayerData(); // This function will load data and store it in playerData
  showMenu(); // Shows menu at the start
    const levelInfo = levelsData.find(level => level.level === playerData.level);
    if(levelInfo) {
      setLevelBackground(levelInfo);
    }
    console.log(playerData);
    console.log(levelsData); // Zobraziť údaje o úrovni
    displayPlayerData(playerData);
    const castButton = document.getElementById("castButton");
    if (castButton) {
      castButton.addEventListener('click', castLine); // Pridáva udalosť pre kliknutie
      castButton.style.display = "none"; // Skryje tlačidlo na začiatku
    }
}
  
initGame();