



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
  for (let i = 1;i<=pocetDni;i++){
  const sloupceDen = document.createElement('td');
  sloupceDen.textContent = i;
  denVTabulce.appendChild(sloupceDen)
}
  //vytvoří buňky pro názvy dnů
  for (let j = 1;j<=pocetDni;j++){
  const sloupceDnyVTydnu = document.createElement('td');
  let denVTydnu = new Date(rok, mesic-1, j).getDay()
  sloupceDnyVTydnu.textContent = dnyVTydnu[denVTydnu];
  dnyVTydnuTabulce.appendChild(sloupceDnyVTydnu)
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
document.getElementById('přidavač').addEventListener('click', function() {
  const table = document.querySelector('table');
  const cellCount = pocetDni;
  const newRow = document.createElement('tr');
  const rows = table.querySelectorAll('tr');
  const rowIndex = rows.length;

  for (let i = 0; i < cellCount; i++) {
    const td = document.createElement('td');
    td.setAttribute('contenteditable', 'true');
    td.setAttribute('data-col', i);
    td.setAttribute('data-row', rowIndex);
    newRow.appendChild(td);
  }
  table.appendChild(newRow);
});

// odebere řádky z tabulky
document.getElementById('ubírač').addEventListener('click', function() {
  const table = document.querySelector('table');
  const rows = table.querySelectorAll('tr');
  if (rows.length > 1) {
    table.removeChild(rows[rows.length - 1]);
  };})

renderKalendar(2026,2)