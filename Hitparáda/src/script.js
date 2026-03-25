
let pocetDni = 0
// kalendář
const dnyVTydnu = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"]
function renderKalendar(rok, mesic) {
  const rokVTabulce = document.getElementById('Rok');
  const měsícVTabulce = document.getElementById('Měsíc')
  const denVTabulce = document.getElementById('Den')
  const dnyVTydnuTabulce = document.getElementById('DenVTýdnu')
  rokVTabulce.innerHTML = ''; //vyčistí předchozí obsah

  //zjistí počet dní v měsíci(0. den následujícího měsíce je poslední den aktuálního)
  pocetDni = new Date(rok, mesic, 0).getDate();

  //vytvoří buňku pro rok
  const sloupceRok = document.createElement('td');
  sloupceRok.textContent = rok;
  sloupceRok.colSpan = pocetDni; 
  
  rokVTabulce.appendChild(sloupceRok);

  //vytvoří buňku pro měsíc
  const sloupceMěsíc = document.createElement('td');
  sloupceMěsíc.textContent = mesic;
  sloupceMěsíc.colSpan = pocetDni;

  měsícVTabulce.appendChild(sloupceMěsíc)

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