let levelsData = null; // Globálna premenná pre údaje o úrovni
let keyDownTimer; // Timer for keydown event
let fishCatchTimer; // Timer for catching fish
let catchTime; // This will be a random time between 10 and 30 seconds
let isCastingEnabled = true; // Global variable to manage casting state

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
  playerData = await getPlayerData(); // Loads data into the playerData variable
  displayPlayerData(playerData);
}
// Aktualizácia hráčových údajov
async function updatePlayerData(newData) {
  try {
    const response = await fetch('http://localhost:3000/update', {
      method: 'POST', // Zmena na POST
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    });
    const updatedData = await response.json();
    displayPlayerData(updatedData.data); // Aktualizuje zobrazenie s novými údajmi
    return updatedData;
  } catch (error) {
    console.error("Chyba pri aktualizácii hráčových dát:", error);
  }
}

function showMenu() {
  document.getElementById('menu').style.display = 'flex';
}

// Funkcia na skrytie menu
function hideMenu() {
  document.getElementById('menu').style.display = 'none';
}
async function catchFish() {
  clearTimeout(fishCatchTimer); // Stop the timer as fish is caught
  const currentLevel = playerData.level; // Or other way to get the player's level
  const levelInfo = levelsData.find(level => level.level === currentLevel);

  // Adds fish to inventory
  if (levelInfo) {
      const newFish = {
          species: levelInfo["ryba-druh"],
          value: levelInfo.cena
      };

      // Checks if the fish of the same species already exists in the inventory
      let fishIndex = playerData.inventory.findIndex(fish => fish.species === newFish.species);
      if (fishIndex !== -1) {
          // Adds the value to the existing item
          playerData.inventory[fishIndex].value += newFish.value;
      } else {
          // Adds the new fish to inventory
          playerData.inventory.push(newFish);
      }

      // Updates player data
      await updatePlayerData(playerData);

      // Updates display of player data
      displayPlayerData(playerData);

      isCastingEnabled = true; // Enables casting again for next round
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
  console.log("Udica sa hodila!"); // Potvrdiť v konzole, že udica bola hodena
  isCastingEnabled = false; // Zastaví opätovné hodenie, kým sa nevykoná akcia chytenia alebo resetu

  // Vygeneruje náhodný čas (medzi 10 a 30 sekundami) a potom zobrazí tlačidlo na chytenie ryby
  catchTime = Math.floor(Math.random() * (30000 - 10000 + 1) + 10000);
  setTimeout(showCatchButton, catchTime);
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
function showCatchButton() {
  const castButton = document.getElementById("castButton");
  if (castButton) {
      castButton.style.display = "block"; // Zobrazí tlačidlo na chytenie ryby
      console.log("Môžeš chytiť rybu!"); // Informuje v konzole

      // Nastaví časovač na skrytie tlačidla na chytenie ryby (po 3 sekundách)
      setTimeout(() => {
          castButton.style.display = "none";
          console.log("Ryba ušla!"); // Informuje v konzole, ak hráč nestihne kliknúť
          isCastingEnabled = true; // Umožní opätovné hodenie udice
      }, 3000);
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
  fishCatchTimer = setTimeout(showCatchButton, catchTime);
  
}

async function startGame() {
  hideMenu(); // Skryje menu
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