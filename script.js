let levelsData = null; // Globálna premenná pre údaje o úrovni
let keyDownTimer; // Timer for keydown event
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

// Aktualizácia hráčových údajov
async function updatePlayerData(newData) {
  try {
    const response = await fetch('./data.json', {
      method: 'PUT', // alebo 'POST' alebo iný podľa vašej API konfigurácie
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    });
    return response.json();
  } catch (error) {
    console.error("Chyba pri aktualizácii hráčových dát:", error);
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

function setLevelBackground(levelData) {
    const gameArea = document.getElementById("gameArea");
    if(gameArea && levelData.image) {
      gameArea.style.backgroundImage = `url('./${levelData.image}')`;
    }
  }

// Klávesový vstup pre počítače
document.addEventListener('keydown', (event) => {
  if ((event.key === "w" || event.key === "W") && isCastingEnabled) {
    // Začína odpočítavanie
    if(!keyDownTimer){
      keyDownTimer = setTimeout(() => {
        showCastButton();
        isCastingEnabled = false; // Disable further casting until reset
      }, 5000); // 5 sekúnd
    }
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === "w" || event.key === "W") {
    // Zruší odpočítavanie ak užívateľ pustí klávesu pred 5 sekundami
    clearTimeout(keyDownTimer);
    keyDownTimer = null;
  }
});

// Gyroskop pre mobily
window.addEventListener('deviceorientation', (event) => {
  let beta = event.beta; // Beta je rotácia okolo osi X, ktorá meria náklon hore a dole.
  if(beta < 45 && isCastingEnabled){ // Displej je naklonený nahor
    showCastButton();
    isCastingEnabled = false; // Zastaviť detekciu naklonenia kým sa neklikne na tlačidlo
  }
});

function showCastButton() {
  const castButton = document.getElementById("castButton");
  if (castButton) {
    castButton.style.display = "block"; // Zobrazí tlačidlo
  }
}

function castLine() {
  const castButton = document.getElementById("castButton");
  if (castButton) {
    castButton.style.display = "none"; // Skryje tlačidlo
  }
  isCastingEnabled = true; // Enable casting again
}

async function initGame() {
    await loadLevelsData();  // Načítanie údajov o úrovni
    const playerData = await getPlayerData(); // Získanie údajov o hráči
    const levelInfo = levelsData.find(level => level.level === playerData.level);
    if(levelInfo) {
      setLevelBackground(levelInfo);
    }
    console.log(playerData);
    console.log(levelsData); // Zobraziť údaje o úrovni
    const castButton = document.getElementById("castButton");
    if (castButton) {
      castButton.addEventListener('click', castLine); // Pridáva udalosť pre kliknutie
      castButton.style.display = "none"; // Skryje tlačidlo na začiatku
    }
}
  
initGame();
