
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
const minNocnichSmen = 3;

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
document.getElementById('uloz').addEventListener('click', ulozData);
document.getElementById('nacti').addEventListener('click', importovatZeSouboru);

/** funkce k uložení aktuálního měsíce do JSON souboru
 *  
 */
function ulozData(){
  let datoveRadky = document.querySelectorAll('.datovyRadek');

  let dataKulozeni = { rok: selectRok.value,
    mesic: selectMesic.value,
    zamestnanci: Array.from(datoveRadky).map(row => {
      return {
        uvazek: row.children[indexUvazek].textContent,
        jmeno: row.children[indexJmeno].textContent,
        hodinyMinule: row.children[indexHodinyZMinulehoMesice].textContent,
        smeny: Array.from(row.querySelectorAll('.bunkaSeSmenami')).map(td => td.textContent)};
    })}

    //Bridge je objekt s funkcí v preLoadu, posílá data z render do main scriptu
    window.Bridge.ulozData(dataKulozeni);
}


/** funkce načítající data ze zvoleného JSON souboru, pokud žádný není vybrán nic neudělá. navolí správný rok, vygeneruje nanovo tabulku a dosadí data
 * 
 */
async function importovatZeSouboru() {
  const data = await window.Bridge.nacistData();
  if (!data) return;

  selectRok.value = data.rok;
  selectMesic.value = data.mesic;
  
  renderKalendar(parseInt(data.rok), parseInt(data.mesic));

  document.querySelectorAll('.datovyRadek').forEach(el => el.remove());

  data.zamestnanci.forEach(z => {
    pridaniRadku();
    const posledniRadek = document.querySelector('tbody tr:last-child');
    
    posledniRadek.children[indexUvazek].textContent = z.uvazek;
    posledniRadek.children[indexJmeno].textContent = z.jmeno;
    posledniRadek.children[indexHodinyZMinulehoMesice].textContent = z.hodinyMinule;
    
    const bunkySmen = posledniRadek.querySelectorAll('.bunkaSeSmenami');
    z.smeny.forEach((smena, i) => {
      if (bunkySmen[i]) bunkySmen[i].textContent = smena;
    });
  });
  
  document.querySelectorAll('.datovyRadek').forEach(row => {
    row.children[pocetDniVMesici + indexSloupceZacatkuKalendare].textContent = spoctiHodiny(row);
  });
} 

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
  oznacVikendyASvatky();
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

/**funkce která vrátí měsíc a den pro daný rok na které připadá velikonoční neděle
 * @param {rokProVypocetDataVelikonoc} rok 
 * @returns měsíc a den velikonoc
 */
function vypocetVelikonoc(rok) {
  const a = rok % 19;
  const b = Math.floor(rok / 100);
  const c = rok % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mesic = Math.floor((h + l - 7 * m + 114) / 31); // 3 = březen, 4 = duben
  const den = ((h + l - 7 * m + 114) % 31) + 1;

  return { mesic: mesic,
           den: den
         };
}

/** funkce která označí celý sloupec classou "vikend"
 * @param {sloupecDne} indexSloupce 
 */
function dejClassuVikendu(indexSloupce){
  Array.from(document.querySelectorAll('tbody tr')).forEach(row => {
    const bunka = row.children[indexSloupce];       
    bunka.classList.add('vikend');  
  });
}

/** funkce která označí celý sloupec classou "svatek"
 * @param {sloupecDne} indexSloupce 
 */
function dejClassuSvatku(indexSloupce){
  Array.from(document.querySelectorAll('tbody tr')).forEach(row => {
    const bunka = row.children[indexSloupce];       
    bunka.classList.add('svatek');  
  });
}

/** funkce která přidělí všem buňkám ve sloupci classy "vikend" nebo "svatek" v měsíci
 */
function oznacVikendyASvatky(){
  const poleDnyVTydnu = Array.from(document.getElementById('DenVTýdnu').children);
  const poleDatumVMesici = Array.from(document.getElementById('Den').children);
  const dnesniDatum = {
    mesic: parseInt(selectMesic.value),
    rok: parseInt(selectRok.value)
  };
  const datumVelikonoc = vypocetVelikonoc(dnesniDatum.rok)

  poleDnyVTydnu.forEach((td, colIndex) => {
    if (td.textContent==='Ne'||td.textContent==='So'){
      dejClassuVikendu(colIndex);
    }   
  });

  if (dnesniDatum.mesic === 1) {
    const indexSloupce = poleDatumVMesici.findIndex((td)=> td.textContent === '1');
    dejClassuSvatku(indexSloupce);
  } else if (dnesniDatum.mesic === datumVelikonoc.mesic){
      const indexSloupce = poleDatumVMesici.findIndex((td)=> td.textContent === String(datumVelikonoc.den-2));
      dejClassuSvatku(indexSloupce);
      const indexSloupce2 = poleDatumVMesici.findIndex((td)=> td.textContent === String(datumVelikonoc.den+1));
      dejClassuSvatku(indexSloupce2);
  } else if (dnesniDatum.mesic === 5){
      const indexSloupce = poleDatumVMesici.findIndex((td)=> td.textContent === '1');
      dejClassuSvatku(indexSloupce);
      const indexSloupce2 = poleDatumVMesici.findIndex((td)=> td.textContent === '8');
      dejClassuSvatku(indexSloupce2);
  } else if (dnesniDatum.mesic === 7){
      const indexSloupce = poleDatumVMesici.findIndex((td)=> td.textContent === '5');
      dejClassuSvatku(indexSloupce);
      const indexSloupce2 = poleDatumVMesici.findIndex((td)=> td.textContent === '6');
      dejClassuSvatku(indexSloupce2);
  } else if (dnesniDatum.mesic === 9){
      const indexSloupce = poleDatumVMesici.findIndex((td)=> td.textContent === '28');
      dejClassuSvatku(indexSloupce);
  } else if (dnesniDatum.mesic === 10){
      const indexSloupce = poleDatumVMesici.findIndex((td)=> td.textContent === '28');
      dejClassuSvatku(indexSloupce);
  } else if (dnesniDatum.mesic === 11){
      const indexSloupce = poleDatumVMesici.findIndex((td)=> td.textContent === '17');
      dejClassuSvatku(indexSloupce);
  } else if (dnesniDatum.mesic === 12){
      const indexSloupce = poleDatumVMesici.findIndex((td)=> td.textContent === '24');
      dejClassuSvatku(indexSloupce);
      const indexSloupce2 = poleDatumVMesici.findIndex((td)=> td.textContent === '25');
      dejClassuSvatku(indexSloupce2);
      const indexSloupce3 = poleDatumVMesici.findIndex((td)=> td.textContent === '26');
      dejClassuSvatku(indexSloupce3);
  };
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
  oznacVikendyASvatky();
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
      hodiny += parseFloat(radek.querySelector('.hodinyZMinulehoMesice').textContent) || 0;
      Array.from(radek.querySelectorAll('.bunkaSeSmenami')).forEach(td => {
        if (td.textContent === "D") hodiny += 12
        else if (td.textContent === "N") hodiny += 12
        else if (td.textContent === "R") hodiny += 8;
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
    const tdPredchozi = radek.children[den-1]
    return tdPredchozi.textContent !== "D" && td.textContent !== "D" && td.textContent !== "V" && td.textContent !== "N" && td.textContent !== "R" && td.textContent !== "poN";
  })
  ;
  return dostupniLide;
}

/** funkce pro zamíchání pole s dostupnými lidmi podle již přidělených/odpracovaných hodin. zohledňuje výši úvazku
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
/** funkce pro přidání noční směny, bere v potaz minimum nočních směn pro každého člověka
 * @param {poleSDostupnymiLidmi} dostupniLide 
 * @param {aktualniSloupec} den 
 * @param {objektSPotrebamiSmen} potrebaSmen 
 */
function pridejNocniSmenu(dostupniLide, den, potrebaSmen){
  const zbyliLide = dostupniLide.slice((potrebaSmen.denni+potrebaSmen.ranni));
  for (let i = potrebaSmen.denni + potrebaSmen.ranni; i < potrebaSmen.nocni + potrebaSmen.denni + potrebaSmen.ranni && i < dostupniLide.length; i++) {
    const dostupniLideBezNocnich = zbyliLide.filter(radek => {
      return pocetNocnichSmen(radek) < minNocnichSmen});
 
    if (dostupniLideBezNocnich.length === 0){
      const tdSmeny = dostupniLide[i].children[den]; 
      tdSmeny.textContent = "N";
    } else {const tdSmeny = dostupniLideBezNocnich[0].children[den]; 
        tdSmeny.textContent = "N"}
  }
}

/** přidělí směny v pracovní dny
 * @param {poleSDostupnymiLidmi} dostupniLide 
 * @param {aktualniSloupec} den 
 * @param {objektSPotrebamiSmen} potrebaSmen
 */
function pridelSmenyVPracovniDny(dostupniLide, den, potrebaSmen) {
  for (let j = 0; j < potrebaSmen.denni && j < dostupniLide.length; j++) {
    const tdSmeny = dostupniLide[j].children[den]; 
    tdSmeny.textContent = "D";      
  }

  for (let k = potrebaSmen.denni; k < potrebaSmen.denni + potrebaSmen.ranni; k++) {
    const tdSmeny = dostupniLide[k].children[den]; 
    tdSmeny.textContent = "R";
  }

  pridejNocniSmenu (dostupniLide, den, potrebaSmen);
}

/**přidělí směny o víkendech 
 * @param {poleSDostupnymiLidmi} dostupniLide 
 * @param {aktualniSloupec} den 
 * @param {objektSPotrebamiSmen} potrebaSmen
 */
function pridelSmenyOVikendech (dostupniLide, den, potrebaSmen) {
  for (let j = 0; j < potrebaSmen.denniVikendova && j < dostupniLide.length; j++) {
    const tdSmeny = dostupniLide[j].children[den]; 
    tdSmeny.textContent = "D";      
  }

  pridejNocniSmenu (dostupniLide, den, potrebaSmen);
}

/** funkce pro přidělení směn
 * @param {poleSDostupnymiLidmi} dostupniLide 
 * @param {aktualniSloupec} den 
 * @param {objektSPotrebamiSmen} potrebaSmen
 */
function pridelSmeny(dostupniLide, den, potrebaSmen) {
  if (dostupniLide[0].children[den].classList.contains('vikend')||dostupniLide[0].children[den].classList.contains('svatek')) {
    pridelSmenyOVikendech(dostupniLide, den, potrebaSmen)
  } else {pridelSmenyVPracovniDny(dostupniLide, den, potrebaSmen)}
}

/**
 * 
 * @param {radekSPracovnikem} radek 
 * @returns pocet kolik nočních už má přiděleno
 */
function pocetNocnichSmen(radek) {
  let pocitadloNocnich = 0;
  Array.from(radek.querySelectorAll('.bunkaSeSmenami')).forEach(td => {
    if (td.textContent === "N") {
      pocitadloNocnich++;
    }
  });
  return pocitadloNocnich;
}

/** funkce pro vygenerování objektu s potřebami směn v měsíci
 * @returns objekt s potřebami směn v měsíci
 */
function zjistiPotrebuSmen() {
  const potrebaSmen = {
  denni: parseInt(document.getElementById('vyberPoctuNaDenni').value),
  ranni: parseInt(document.getElementById('vyberPoctuNaRanni').value),
  nocni: parseInt(document.getElementById('vyberPoctuNaNocni').value),
  denniVikendova: parseInt(document.getElementById('vyberPoctuNaDenniVikendy').value),
  nocniVikendova: parseInt(document.getElementById('vyberPoctuNaNocniVikendy').value)  
};
 return potrebaSmen
}

/** funkce která zjistí jestli v tabulce už nejsou vyplněné některé směny a zohlední je při generaci směn
 * @param {nastavenaPotrebaSmen} potrebaSmen 
 * @param {poleSRadky} radky 
 * @param {indexSloupceKeKontrole} den 
 * @returns upravenou kopii puvodni potrebySmen
 */
function zjistiPozadavky(potrebaSmen, radky, den) {
  let potrebaSmenPoPozadavcich = {...potrebaSmen};
  
  radky.forEach(row => {
    const obsahbunky = row.children[den].textContent.trim();
    const jeVikend = row.children[den].classList.contains('vikend');
    const jeSvátek = row.children[den].classList.contains('svatek');

    if (obsahbunky !== '') {
      if (obsahbunky === 'D' && !jeVikend && !jeSvátek) {
        potrebaSmenPoPozadavcich.denni -= 1;
      } else if (obsahbunky === 'R' && !jeVikend && !jeSvátek) {
        potrebaSmenPoPozadavcich.ranni -= 1;
      } else if (obsahbunky === 'N' && !jeVikend && !jeSvátek) {
        potrebaSmenPoPozadavcich.nocni -= 1;
      } else if (obsahbunky === 'D' && (jeVikend || jeSvátek)) {
        potrebaSmenPoPozadavcich.denniVikendova -= 1;
      } else if (obsahbunky === 'N' && (jeVikend || jeSvátek)) {
        potrebaSmenPoPozadavcich.nocniVikendova -= 1;
      }
    }
  });
  return potrebaSmenPoPozadavcich;
}

/**funkce pro vygenerování směn v celém měsíci. Bere v potaz úvazek, i hodiny z předešlého měsíce.
 * 
 */
function generujSmeny() {
  const radky = document.querySelectorAll('.datovyRadek');
  //document.querySelectorAll('.bunkaSeSmenami').forEach(bunka => bunka.textContent = '');
  const potrebaSmen = zjistiPotrebuSmen();

  for (let den = indexSloupceZacatkuKalendare; den <= pocetDniVMesici + pocetSloupcuKonceKalendare; den++) {
    kontrolaVcerejsiSmeny(radky, den);
    const potrebaSmenPoPozadavcich = zjistiPozadavky(potrebaSmen, radky, den)
    const dostupniLide=ziskejDostupneLidi(radky, den);
    zamichejDostupneLidi(dostupniLide);
    pridelSmeny(dostupniLide, den, potrebaSmenPoPozadavcich);
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