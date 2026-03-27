



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

// odebere řádky z tabulky
document.getElementById('ubírač').addEventListener('click', function() {
  const table = document.querySelector('table');
  const rows = table.querySelectorAll('tr');
  if (rows.length > 1) {
    table.removeChild(rows[rows.length - 1]);
  };})

//zajistí aby prvotní render byl na dnešní rok/měsíc
selectMesic.value = new Date().getMonth()+1
selectRok.value = new Date().getFullYear()
renderKalendar(new Date().getFullYear(),new Date().getMonth()+1)

//musíš spočítat kolik tam je řádků přidaných předtím než měníš měsíc, pak je smazat a pak je znovu vygenerovat. myslím