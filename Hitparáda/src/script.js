



// kalendář
const selectMesic = document.getElementById('selectMěsíc');
const selectRok = document.getElementById('selectRok');
let pocetDni = 0
const dnyVTydnu = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"]

//vyplní roletku pro roky
for (let r = 2020; r <= 2030; r++) {
const opt = document.createElement('option');
opt.value = r;
opt.textContent = r;
selectRok.appendChild(opt);
}
//funkce k vykreslení kalendáře
function renderKalendar(rok, mesic) {

//čistka
  document.getElementById('Den').innerHTML = '';
  document.getElementById('DenVTýdnu').innerHTML = '';


  const denVTabulce = document.getElementById('Den');
  const dnyVTydnuTabulce = document.getElementById('DenVTýdnu');

  //zjistí počet dní v měsíci(0. den následujícího měsíce je poslední den aktuálního)
  pocetDni = new Date(rok, mesic, 0).getDate();

  //roztáhne buňku pro rok
  document.getElementById('rokSpan').colSpan = pocetDni; 

  //roztáhne buňku pro měsíc
  document.getElementById('měsícSpan').colSpan = pocetDni;


  //vytvoří buňky pro dny
  for (let i = -2;i<=pocetDni+2;i++){
  const sloupceDen = document.createElement('td');
  if (i<1) {sloupceDen.textContent = ''} else {sloupceDen.textContent = i};
  if (i>pocetDni) {sloupceDen.textContent = ''}
  denVTabulce.appendChild(sloupceDen);
}
  //vytvoří buňky pro názvy dnů
  for (let j = -2;j<=pocetDni+2;j++){
  const sloupceDnyVTydnu = document.createElement('td');
  let denVTydnu = new Date(rok, mesic-1, j).getDay();
  if (j<1) {sloupceDnyVTydnu.textContent = ''} else {sloupceDnyVTydnu.textContent = dnyVTydnu[denVTydnu]};
  if (j>pocetDni) {sloupceDnyVTydnu.textContent = ''};
  dnyVTydnuTabulce.appendChild(sloupceDnyVTydnu);

  const celkovaSirka = 3 + pocetDni + 2; // +1 kvůli sloupci "Jména"
  synchronizujRadky(celkovaSirka);
}
}


//funkce k znovunačtení tabulky podle výběru v roletkách
function aktualizuj() {
  const vybranyMesic = parseInt(selectMěsíc.value); 
  const vybranyRok = parseInt(selectRok.value);
  renderKalendar(vybranyRok, vybranyMesic);
}
//spouštěče při změnách v roletkách roku a měsíců
selectMěsíc.addEventListener('change', aktualizuj);
selectRok.addEventListener('change', aktualizuj);


//přídá řádky do tabulky
function přidáníŘádku(){
  const table = document.querySelector('table');
  const newRow = document.createElement('tr');
  const rows = table.querySelectorAll('tr');
  const rowIndex = rows.length-4;

  for (let i = 0; i < pocetDni+5; i++) {
    const td = document.createElement('td');
    td.setAttribute('contenteditable', 'true');
    td.setAttribute('data-col', i);
    td.setAttribute('data-row', rowIndex);
    newRow.appendChild(td);
  }
  table.appendChild(newRow);
};
document.getElementById('přidavač').addEventListener('click', přidáníŘádku);


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


const potrebaSmen = {
  denni: 3, // Počet lidí na ranní
  nocni: 2  // Počet lidí na noční
};

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
  for (let den = 3; den <= pocetDni+2; den++) {
    const colIndex = den;
    
    //zkontroluje všechny jestli den předtím nebyli v práci
    radky.forEach(row => {
      const td = row.children[colIndex];
      const vcerejsiSmena = den > 1 ? row.children[colIndex - 1].textContent : "";
      
      if (vcerejsiSmena === "N") {
        td.textContent = "poN";
        td.style.backgroundColor = "#f5f5f5";
        return;
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

  // 3. Pokud jsou ve stejné hladině, rozhodne NÁHODA
      return Math.random() - 0.5;
    });
      //náhodně je zamíchá

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
    row.children[pocetDni+3].textContent = spoctiHodiny(row)
  })
};

// odebere řádky z tabulky
document.getElementById('ubírač').addEventListener('click', function() {
  const table = document.querySelector('table');
  const rows = table.querySelectorAll('tr');
  if (rows.length > 1) {
    table.removeChild(rows[rows.length - 1]);
  };})
document.getElementById('generatorSmen').addEventListener('click', generujSmeny)
//zajistí aby prvotní render byl na dnešní rok/měsíc
selectMesic.value = new Date().getMonth()+1
selectRok.value = new Date().getFullYear()
renderKalendar(new Date().getFullYear(),new Date().getMonth()+1)
