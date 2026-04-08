
// kalendář
const selectMesic = document.getElementById('selectMěsíc');
const selectRok = document.getElementById('selectRok');
let pocetDniVMesici = 0;
const indexUvazek = 0;
const indexJmeno = 1;
const indexHodinyZMinulehoMesice = 2;
const indexSloupceZacatkuKalendare= 3;
const pocetSloupcuKonceKalendare= 2;
const indexRadkuHlavicky= 4;
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
 * @param {cislo} rok
 * @param {cislo} mesic
 */
function renderKalendar(rok, mesic) {
  document.getElementById('Den').innerHTML = '';
  document.getElementById('DenVTýdnu').innerHTML = '';

  const denVTabulce = document.getElementById('Den');
  const dnyVTydnuTabulce = document.getElementById('DenVTýdnu');
  pocetDniVMesici = new Date(rok, mesic, 0).getDate();
  const celkovaSirka = indexSloupceZacatkuKalendare + pocetDniVMesici + pocetSloupcuKonceKalendare;

  document.getElementById('rokSpan').colSpan = pocetDniVMesici; 
  document.getElementById('měsícSpan').colSpan = pocetDniVMesici;
  
  for (let prazdneBunkyPredKalendarem = 0; prazdneBunkyPredKalendarem< indexSloupceZacatkuKalendare; prazdneBunkyPredKalendarem++){
    denVTabulce.appendChild(pridejBunku());
    dnyVTydnuTabulce.appendChild(pridejBunku());
  }

  for (let cislaKalendarnichDnu = 1;cislaKalendarnichDnu<=pocetDniVMesici; cislaKalendarnichDnu++){
    const sloupecDen = pridejBunku();
    sloupecDen.textContent = cislaKalendarnichDnu;
    denVTabulce.appendChild(sloupecDen);
  }

  for (let nazevDneVtydnu = 1; nazevDneVtydnu <= pocetDniVMesici; nazevDneVtydnu++){
    const sloupceDnyVTydnu = pridejBunku();
    let denVTydnu = new Date(rok, mesic-1, nazevDneVtydnu).getDay();
    sloupceDnyVTydnu.textContent = dnyVTydnu[denVTydnu];
    dnyVTydnuTabulce.appendChild(sloupceDnyVTydnu);
  }

  for (let prazdneBunkyZaKalendarem = 0; prazdneBunkyZaKalendarem<pocetSloupcuKonceKalendare; prazdneBunkyZaKalendarem++){
    denVTabulce.appendChild(pridejBunku());
    dnyVTydnuTabulce.appendChild(pridejBunku());
  }
  synchronizujRadky(celkovaSirka);
}

//funkce k znovunačtení tabulky podle výběru v roletkách
function aktualizujKalendar() {
  const vybranyMesic = parseInt(selectMesic.value); 
  const vybranyRok = parseInt(selectRok.value);
  renderKalendar(vybranyRok, vybranyMesic);
}

/** přidá classy/atributy bunce
 * @param {HTMLElementBunky} bunka
 * @param {cislo} indexBunky
 */
function pridelClassuPodleSloupce(bunka,indexBunky){
  bunka.className = '';
  bunka.contentEditable = true;
  if (indexBunky===indexUvazek){
    bunka.className = ' uvazek';
    bunka.setAttribute('data-col', indexBunky)
  } else if (indexBunky===indexJmeno){
    bunka.className = ' jmeno';
    bunka.setAttribute('data-col', indexBunky)
  } else if (indexBunky===indexHodinyZMinulehoMesice){
    bunka.className = ' hodinyZMinulehoMesice';
    bunka.setAttribute('data-col', indexBunky)
  } else if (indexBunky>=indexSloupceZacatkuKalendare && indexBunky<indexSloupceZacatkuKalendare+pocetDniVMesici){
    bunka.className = ' bunkaSeSmenami';
    bunka.setAttribute('data-col', indexBunky)
  } else if (indexBunky===pocetDniVMesici+indexSloupceZacatkuKalendare){
    bunka.className = ' hodinyTentoMesic';
    bunka.setAttribute('data-col', indexBunky)
    bunka.contentEditable = false;
  } else if (indexBunky===pocetDniVMesici+indexSloupceZacatkuKalendare+1){
    bunka.className = ' prevodHodinDal'
    bunka.setAttribute('data-col', indexBunky)
  }
}

/** vytvori bunku
 * @returns {HTMLElementBunky}
 */
function pridejBunku(){
  const bunka = document.createElement('td')
  return bunka
}

/**přídá řádek do tabulky
 * @returns {HTMLElementNovyRadekTabulky}
 */
function pridaniRadku(){
  const tabulka = document.querySelector('tbody');
  const novyRadek = document.createElement('tr');
  const indexRadku = tabulka.querySelectorAll('tr').length-indexRadkuHlavicky;
  const extraSloupce= indexSloupceZacatkuKalendare + pocetSloupcuKonceKalendare;
  for (let sloupec = 0; sloupec < pocetDniVMesici + extraSloupce; sloupec++) {
    const td = pridejBunku()
    pridelClassuPodleSloupce(td, sloupec)
    novyRadek.setAttribute('data-row', indexRadku);
    novyRadek.appendChild(td);
  }
  novyRadek.className = ' datovyRadek';
  tabulka.appendChild(novyRadek);
};

/**funkce pro synchronizaci počtu sloupců při změně v roletkách a vyčištění datových buňěk
 * @param {cislo} novyPocetSloupcu
 */
function synchronizujRadky(novyPocetSloupcu) {
  const datoveRadky = document.querySelectorAll(' .datovyRadek');

  datoveRadky.forEach((row) => {
    while (row.children.length < novyPocetSloupcu) {
      const td = pridejBunku();
      row.appendChild(td);
    }

    while (row.children.length > novyPocetSloupcu) {
      row.removeChild(row.lastChild);
    }

    Array.from(row.children).forEach((td, colIndex) => {
      pridelClassuPodleSloupce(td, colIndex);
      if (colIndex>2) {td.innerHTML = ''};
    });
  });
}

/**funkce co spočte kolik hodin aktuálně člověk v měsíci má
 * @param {radekPracovnika} radek 
 * @returns {vratiSoucetHodinPracovnika} vrati soucet hodin daneho pracovnika(radku)
 */
function spoctiHodiny(radek) {
      let hodiny = 0;
      hodiny += parseFloat(radek.querySelector(' .hodinyZMinulehoMesice').textContent) || 0;
      Array.from(radek.querySelectorAll(' .bunkaSeSmenami')).forEach(td => {
        if (td.textContent === "D") hodiny += 12
        else if (td.textContent === "N") hodiny += 12;
  });
      return hodiny;
}

/**funkce co projde včerejší směny a přidělí poN pokud byl člověk na noční
 * @param {radkyVsechPracovniku} radky
 * @param {aktualniSloupec} den
 * */
function kontrolaVcerejsiSmeny(radky, den){
  radky.forEach(row => {
    const td = row.children[den];
    const vcerejsiSmena = den > indexSloupceZacatkuKalendare ? row.children[den - 1].textContent : "";
      
    if (vcerejsiSmena === "N") {
      td.textContent = "poN";      
    }
  });
}

/**funkce pro ziskani pole s dostupnymi lidmi
 * @param {radkyVsechPracovniku} radky
 * @param {aktualniSloupec} den
 * @returns {poleSLidmi} vrati pole s dostupnymi lidmi
 */
function ziskejDostupneLidi (radky, den){
  const dostupniLide = Array.from(radky).filter(radek => {
      const td = radek.children[den];
      return td.textContent !== "D" && td.textContent !== "V" && td.textContent !== "N" && td.textContent !== "R" && td.textContent !== "poN";
    });
  return dostupniLide;
}

/**
 * @param {poleSDostupnymiLidmi} dostupniLide 
 */
function zamichejDostupneLidi (dostupniLide) {
  dostupniLide.sort((a, b) => {
    const uvazekA = parseFloat(a.children[indexUvazek].textContent)*160 || 160;
    const uvazekB = parseFloat(b.children[indexUvazek].textContent)*160 || 160;
  
    const pomerA = spoctiHodiny(a) / uvazekA;
    const pomerB = spoctiHodiny(b) / uvazekB;

    const hladinaA = Math.floor(pomerA * 10);
    const hladinaB = Math.floor(pomerB * 10);

    if (hladinaA !== hladinaB) {
      return hladinaA - hladinaB;
      }

      return Math.random() - 0.5; 
  })
}

/** funkce pro přidělení směn
 * @param {poleSDostupnymiLidmi} dostupniLide 
 * @param {aktualniSloupec} den 
 */
function pridelSmeny(dostupniLide, den) {
  for (let i = 0; i < potrebaSmen.nocni && i < dostupniLide.length; i++) {
      const tdSmeny = dostupniLide[i].children[den]; 
      tdSmeny.textContent = "N";
      tdSmeny.style.backgroundColor = "#c5cae9";
      }
      for (let j = potrebaSmen.nocni; j < potrebaSmen.denni+potrebaSmen.nocni && j < dostupniLide.length; j++) {
      const tdSmeny = dostupniLide[j].children[den]; 
      tdSmeny.textContent = "D";
      tdSmeny.style.backgroundColor = "#ebbbc3";
      }
}

/**funkce pro vygenerování směn v celém měsíci. Bere v potaz úvazek, i hodiny z předešlého měsíce.
 * 
 */
function generujSmeny() {
  const radky = document.querySelectorAll('.datovyRadek');

  for (let den = indexSloupceZacatkuKalendare; den <= pocetDniVMesici + pocetSloupcuKonceKalendare; den++) {
    kontrolaVcerejsiSmeny(radky, den);
    const dostupniLide=ziskejDostupneLidi(radky, den);
    zamichejDostupneLidi(dostupniLide);
    pridelSmeny(dostupniLide, den);
  }

  radky.forEach(row=>{
    row.children[pocetDniVMesici+indexSloupceZacatkuKalendare].textContent = spoctiHodiny(row)
  })
};

/** odebere řádek z tabulky
 * 
 */
function odeberRadky(){
  const tabulka = document.querySelector('tbody');
  const radky = tabulka.querySelectorAll('tr');
  if (radky.length > 1) {
    tabulka.removeChild(radky[radky.length - 1]);
  };
}

renderKalendar(new Date().getFullYear(),new Date().getMonth()+1)
