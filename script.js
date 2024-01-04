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
  // displayPlayerData(playerData);
}
// Aktualizácia hráčových údajov
async function updatePlayerData(newData) {
  playerData = newData; // Updates data in the playerData variable
  // console.log(playerData);
  document.getElementById('levelInfo').textContent = playerData.level;
    document.getElementById('moneyInfo').textContent = playerData.money;
  // displayPlayerData(playerData); // Displays updated data
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

function updateStatusInfo(statusText) {
  document.getElementById('statusInfo').textContent = statusText;
}

// Zobrazenie hráčových údajov
function displayPlayerData(data) {
  // Reset the innerHTML of playerData and playerInventory containers
  const playerDataContainer = document.getElementById('playerData');
  const playerInventoryContainer = document.getElementById('playerInventory');
  playerDataContainer.innerHTML = '';
  playerInventoryContainer.innerHTML = '';

  // Display all data except for the inventory
  for (const key in data) {
    if (key !== 'inventory') {
      const keyItem = document.createElement('div');
      keyItem.classList.add('item');
      keyItem.textContent = `${key}: ${data[key]}`;
      playerDataContainer.appendChild(keyItem);
    }
  }

  // Display inventory items
  if (Array.isArray(data.inventory)) {
    data.inventory.forEach(item => {
      // Creating divs for species and value
      const speciesItem = document.createElement('div');
      const valueItem = document.createElement('div');
      speciesItem.classList.add('item');
      valueItem.classList.add('item');

      // Assigning text content, ensuring values are strings
      speciesItem.textContent = `Druh: ${item.species ? item.species.toString() : 'Unknown'}`;
      valueItem.textContent = `Hodnota: ${item.value ? item.value.toString() : '0'}`;

      // Appending to the playerInventory container
      playerInventoryContainer.appendChild(speciesItem);
      playerInventoryContainer.appendChild(valueItem);
    });
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
    updateStatusInfo("Udica sa hodila!");
    isCastingEnabled = false;

    // Show the fishing alert
    document.getElementById('fishingAlert').style.display = 'block';

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

// Klávesový vstup pre počítače
document.addEventListener('keydown', (event) => {
  if ((event.key === "w" || event.key === "W") && isCastingEnabled) {
    // Zobrazit progress bar
    showProgressBar();
    updateProgressBar(0); // Začít na 0%
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
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === "w" || event.key === "W") {
    clearInterval(keyDownTimer); // Zrušit interval při puštění klávesy
    hideProgressBar(); // Skrýt progress bar
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
    actionButton.textContent = playerData.purchasedLevels.includes(level.level) ? 'Prepnúť' : 'Kúpiť';
    actionButton.disabled = playerData.level === level.level;
    actionButton.onclick = playerData.purchasedLevels.includes(level.level) ? 
                            () => switchLevel(level) : 
                            () => buyLevel(level);
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
    const castButton = document.getElementById("castButton");
    if (castButton) {
      castButton.style.display = "block"; // Show the button to catch the fish

      // Hide the fishing alert
      document.getElementById('fishingAlert').style.display = 'none';

      fishCatchTimer = setTimeout(() => {
        if (!isGamePaused) {
          castButton.style.display = "none";
          console.log("Ryba ušla!");
          updateStatusInfo("Ryba ušla!");
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

  // Vygenerovanie náhodného času (v milisekundách) medzi 10 a 30 sekundami
  catchTime = (Math.random() * (30000 - 10000) + 10000).toFixed(0);
  console.log(catchTime);
  // Po uplynutí náhodného času sa zobrazí tlačidlo na chytenie ryby na 3 sekundy
  // fishCatchTimer = setTimeout(showCatchButton, catchTime);
  
}

function pauseGame() {
  console.log("Hra je zastavena.");
  updateStatusInfo("Hra je zastavena.");
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
  updateStatusInfo("Hra pokracuje.");
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
  updatePlayerData(playerData);
  showMenu(); // Shows menu at the start
    const levelInfo = levelsData.find(level => level.level === playerData.level);
    if(levelInfo) {
      setLevelBackground(levelInfo);
    }
    console.log(playerData);
    console.log(levelsData); // Zobraziť údaje o úrovni
    // displayPlayerData(playerData);
    const castButton = document.getElementById("castButton");
    if (castButton) {
      castButton.addEventListener('click', castLine); // Pridáva udalosť pre kliknutie
      castButton.style.display = "none"; // Skryje tlačidlo na začiatku
    }
}
  
initGame();