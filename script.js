let keyDownTimer;

// Klávesový vstup pre počítače
document.addEventListener('keydown', (event) => {
  if (event.key === "w" || event.key === "W") {
    // Začína odpočítavanie
    if(!keyDownTimer){
      keyDownTimer = setTimeout(() => {
        if(isCastingEnabled){
          showCastButton();
          isCastingEnabled = false;
        }
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

let isCastingEnabled = true;

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
  castButton.style.display = "block"; // Zobrazí tlačidlo
}

function castLine() {
  const castButton = document.getElementById("castButton");
  castButton.style.display = "none"; // Skryje tlačidlo
  isCastingEnabled = true; // Povolí detekciu naklonenia
}

// Inicializácia a možné nastavenie hry
function initGame() {
  const castButton = document.getElementById("castButton");
  castButton.addEventListener('click', castLine); // Pridáva udalosť pre kliknutie
  castButton.style.display = "none"; // Skryje tlačidlo na začiatku
}

// Volanie inicializácie pri načítaní
initGame();

