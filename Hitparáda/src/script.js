
// kalendář
const selectMesic = document.getElementById('selectMěsíc');
const selectRok = document.getElementById('selectRok');
let pocetDniVMesici = 0;
const indexSloupceZacatkuKalendare=3;
const indexSloupcuKonceKalendare=2;
const indexRadkuHlavicky=4;
const dnyVTydnu = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"];
const potrebaSmen = {
  denni: 3, // Počet lidí na ranní
  nocni: 2  // Počet lidí na noční
};

//vyplní roletku pro roky
for (let rok = 2022; rok <= new Date().getFullYear()+2; rok++) {
  const opt = document.createElement('option');
  opt.value = rok;
  opt.textContent = rok;
  selectRok.appendChild(opt);
}

selectMesic.value = new Date().getMonth()+1
selectRok.value = new Date().getFullYear()

//při změně v roletce měsícu a let upraví počet buněk dle data
selectMesic.addEventListener('change', aktualizujKalendar);
selectRok.addEventListener('change', aktualizujKalendar);
document.getElementById('přidavač').addEventListener('click', pridaniRadku); //tlačitko pro přidání řádku
document.getElementById('ubírač').addEventListener('click', odeberRadky)
document.getElementById('generatorSmen').addEventListener('click', generujSmeny); //tlačítko pro generování směn

/**funkce k vykreslení hlavičky kalendáře (první 4 řádky)
 * @param {number} rok
 * @param {number} mesic
 */
function renderKalendar(rok, mesic) {
  document.getElementById('Den').innerHTML = '';
  document.getElementById('DenVTýdnu').innerHTML = '';

  const denVTabulce = document.getElementById('Den');
  const dnyVTydnuTabulce = document.getElementById('DenVTýdnu');
  pocetDniVMesici = new Date(rok, mesic, 0).getDate();

  document.getElementById('rokSpan').colSpan = pocetDniVMesici; 
  document.getElementById('měsícSpan').colSpan = pocetDniVMesici;

  for (let prazdneBunkyPredKalendarem = 0; prazdneBunkyPredKalendarem< indexSloupceZacatkuKalendare; prazdneBunkyPredKalendarem++){
    denVTabulce.appendChild(document.createElement('td'));
    dnyVTydnuTabulce.appendChild(document.createElement('td'));
  }

  for (let cislaKalendarnichDnu = 1;cislaKalendarnichDnu<=pocetDniVMesici; cislaKalendarnichDnu++){
    const sloupecDen = document.createElement('td');
    sloupecDen.textContent = cislaKalendarnichDnu;
    denVTabulce.appendChild(sloupecDen);
  }

  for (let nazevDneVtydnu = 1; nazevDneVtydnu <= pocetDniVMesici; nazevDneVtydnu++){
    const sloupceDnyVTydnu = document.createElement('td');
    let denVTydnu = new Date(rok, mesic-1, nazevDneVtydnu).getDay();
    sloupceDnyVTydnu.textContent = dnyVTydnu[denVTydnu];
    dnyVTydnuTabulce.appendChild(sloupceDnyVTydnu);

    const celkovaSirka = indexSloupceZacatkuKalendare + pocetDniVMesici + indexSloupcuKonceKalendare;
    synchronizujRadky(celkovaSirka);
  }

  for (let prazdneBunkyZaKalendarem = 0; prazdneBunkyZaKalendarem<indexSloupcuKonceKalendare; prazdneBunkyZaKalendarem++){
    denVTabulce.appendChild(document.createElement('td'));
    dnyVTydnuTabulce.appendChild(document.createElement('td'));
  }
}

//funkce k znovunačtení tabulky podle výběru v roletkách
function aktualizujKalendar() {
  const vybranyMesic = parseInt(selectMesic.value); 
  const vybranyRok = parseInt(selectRok.value);
  renderKalendar(vybranyRok, vybranyMesic);
}

//přídá řádky do tabulky
function pridaniRadku(){
  const table = document.querySelector('tbody');
  const newRow = document.createElement('tr');
  const rows = table.querySelectorAll('tr');
  const rowIndex = rows.length-indexRadkuHlavicky;
  const extraSloupce= indexSloupceZacatkuKalendare + indexSloupcuKonceKalendare;
  for (let sloupec = 0; sloupec < pocetDniVMesici + extraSloupce; sloupec++) {
    const td = document.createElement('td');
    td.setAttribute('contenteditable', 'true');
    td.setAttribute('data-col', sloupec);
    td.setAttribute('data-row', rowIndex);
    newRow.appendChild(td);
  }
  table.appendChild(newRow);
};

//funkce pro synchronizaci počtu sloupců při změně v roletkách
function synchronizujRadky(novyPocetSloupcu) {
  const datoveRadky = document.querySelectorAll('table tr:not(#Rok):not(#Měsíc):not(#Den):not(#DenVTýdnu)');

  datoveRadky.forEach((row, rowIndex) => {
    // když sloupců přibyde
    while (row.children.length < novyPocetSloupcu) {
      const td = document.createElement('td');
      td.setAttribute('contenteditable', 'true');
      row.appendChild(td);
    }
    // když sloupců ubyde
    while (row.children.length > novyPocetSloupcu) {
      row.removeChild(row.lastChild);
    }

    // přečíslování data-col a data-row kvůli novým sloupcům
    Array.from(row.children).forEach((td, colIndex) => {
      td.setAttribute('data-col', colIndex); // Index sloupce (0, 1, 2... až 31)
      td.setAttribute('data-row', rowIndex); // Index řádku (0, 1, 2...)
      if (colIndex>2) {td.innerHTML = ''};
    });
  });
}

//funkce co spočte kolik hodin aktuálně člověk v měsíci má
function spoctiHodiny(row) {
      let hodiny = 0;
      hodiny += parseFloat(row.children[2].textContent) || 0;
      Array.from(row.children).forEach(td => {
        if (td.textContent === "D") hodiny += 12;
        if (td.textContent === "N") hodiny += 12;
  });
      return hodiny;
}

//funkce pro generování směn v celém měsíci
function generujSmeny() {
  const radky = document.querySelectorAll('table tr:not(#Rok):not(#Měsíc):not(#Den):not(#DenVTýdnu)');
  //cyklus která prochází měsíc po jednotlivých dnech
  for (let den = 3; den <= pocetDniVMesici+2; den++) {
    const colIndex = den;
    
    //zkontroluje všechny jestli den předtím nebyli v práci
    radky.forEach(row => {
      const td = row.children[colIndex];
      const vcerejsiSmena = den > 1 ? row.children[colIndex - 1].textContent : "";
      
      if (vcerejsiSmena === "N") {
        td.textContent = "poN";
        td.style.backgroundColor = "#f5f5f5";
        
      }
    })

      //vytvoří array lidí pro výběr na směnu z lidí co nemají požadavek/nemají už směnu
    const dostupniLide = Array.from(radky).filter(row => {
      const td = row.children[colIndex];
      return td.textContent !== "D" && td.textContent !== "V" && td.textContent !== "N" && td.textContent !== "R" && td.textContent !== "poN"; // D = Dovolená, P = Paragraf
    });

    dostupniLide.sort((a, b) => {
      const uvazekA = parseFloat(a.children[0].textContent)*160 || 160;
      const uvazekB = parseFloat(b.children[0].textContent)*160 || 160;
  
  // 1. Spočítáme procento naplnění (např. 0.25)
      const pomerA = spoctiHodiny(a) / uvazekA;
      const pomerB = spoctiHodiny(b) / uvazekB;

  // 2. Zaokrouhlíme na 10 % (vytvoříme "hladiny")
  // Díky tomu lidé s 21 % a 25 % budou v jedné skupině
      const hladinaA = Math.floor(pomerA * 10);
      const hladinaB = Math.floor(pomerB * 10);

      if (hladinaA !== hladinaB) {
        return hladinaA - hladinaB; // Ti s prázdnějším úvazkem mají přednost
      }

  // míchač
      return Math.random() - 0.5;
    });

      //bere lidi ze zamíchaných dostupných lidí a přiřazuje směny
      for (let i = 0; i < potrebaSmen.nocni && i < dostupniLide.length; i++) {
      const tdSmeny = dostupniLide[i].children[colIndex]; 
      tdSmeny.textContent = "N";
      tdSmeny.style.backgroundColor = "#c5cae9";
      }
      for (let j = potrebaSmen.nocni; j < potrebaSmen.denni+potrebaSmen.nocni && j < dostupniLide.length; j++) {
      const tdSmeny = dostupniLide[j].children[colIndex]; 
      tdSmeny.textContent = "D";
      tdSmeny.style.backgroundColor = "#ebbbc3";
      }

  }
  radky.forEach(row=>{
    row.children[pocetDniVMesici+3].textContent = spoctiHodiny(row)
  })
};

// odebere řádky z tabulky
function odeberRadky(){
  const table = document.querySelector('table');
  const rows = table.querySelectorAll('tr');
  if (rows.length > 1) {
    table.removeChild(rows[rows.length - 1]);
  };
}

renderKalendar(new Date().getFullYear(),new Date().getMonth()+1)
