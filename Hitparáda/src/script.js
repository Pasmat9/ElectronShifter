document.getElementById('přidavač').addEventListener('click', function() {
  const table = document.querySelector('table');
  const headRow = table.querySelector('tr');
  const cellCount = headRow.children.length;
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

document.getElementById('ubírač').addEventListener('click', function() {
  const table = document.querySelector('table');
  const rows = table.querySelectorAll('tr');
  if (rows.length > 1) {
    table.removeChild(rows[rows.length - 1]);
  }
});

