// calendar constants
const daysOfWeek = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"];
let daysInMonth = 0;
const yearsRange = 4;

const WORKLOAD_COLUMN_INDEX = 0;
const NAME_COLUMN_INDEX = 1;
const CARRY_OVER_COLUMN_INDEX = 2;
const DAY_COLUMNS_START_INDEX = 3;

const shiftRequirements = {
    day: 3,
    night: 2
};

window.addEventListener('load', () => {
    const selectMonth = document.getElementById('select-month');
    const selectYear = document.getElementById('select-year');
    const addRowButton = document.getElementById('add-row-button');
    const generateButton = document.getElementById('generate-shifts-button');
    const removeButton = document.getElementById('remove-row-button');
    const table = document.getElementById('calendar-table');

    const currentYear = new Date().getFullYear();
    for (let year = currentYear - yearsRange; year <= currentYear + yearsRange; year++) {
        const opt = document.createElement('option');
        opt.value = year;
        opt.textContent = year;
        selectYear.appendChild(opt);
    }

    selectMonth.value = new Date().getMonth() + 1;
    selectYear.value = new Date().getFullYear();

    selectMonth.addEventListener('change', updateCalendar);
    selectYear.addEventListener('change', updateCalendar);
    addRowButton.addEventListener('click', addRow);
    generateButton.addEventListener('click', generateShifts);

    table.addEventListener('input', event => {
        const target = event.target;
        if (target.classList?.contains('day-cell')) {
            updateCellColor(target, target.textContent.trim());
            updateHoursForAllRows(document.querySelectorAll('.employee-row'));
        }

        if (target.classList?.contains('carry-over-cell')) {
            updateHoursForAllRows(document.querySelectorAll('.employee-row'));
        }
    });

    removeButton.addEventListener('click', () => {
        const tbody = document.querySelector('#calendar-table tbody');
        const rows = tbody.querySelectorAll('.employee-row');
        if (rows.length > 0) {
            tbody.removeChild(rows[rows.length - 1]);
        }
    });

    updateCalendar();
});

/**
 * Apply a style class to a day cell based on its shift value.
 * @param {HTMLTableCellElement} cell - The table cell to style.
 * @param {string} shift - Shift code value ('D', 'N', 'poN').
 */
function updateCellColor(cell, shift) {
    cell.classList.remove('shift-day', 'shift-night', 'shift-post-night');
    if (shift === 'D') {
        cell.classList.add('shift-day');
    } else if (shift === 'N') {
        cell.classList.add('shift-night');
    } else if (shift === 'poN') {
        cell.classList.add('shift-post-night');
    }
}

/**
 * Create a new table cell configured for the given column index.
 * @param {number} columnIndex
 * @returns {HTMLTableCellElement}
 */
function createCellForColumn(columnIndex) {
    const cell = document.createElement('td');
    applyColumnClass(cell, columnIndex);
    return cell;
}

/**
 * Compute total columns for each employee row based on current month length.
 * @returns {number}
 */
function getTotalColumnCount() {
    // Total columns for each employee row:
    // workload + name + carry-over + all day columns + total hours + extra meta cell
    return DAY_COLUMNS_START_INDEX + daysInMonth + 2;
}

/**
 * Assign a semantic cell class and contentEditable state depending on column.
 * @param {HTMLTableCellElement} cell
 * @param {number} columnIndex
 */
function applyColumnClass(cell, columnIndex) {
    cell.className = '';
    cell.contentEditable = 'false';

    if (columnIndex === WORKLOAD_COLUMN_INDEX) {
        cell.className = 'workload-cell';
        cell.contentEditable = 'true';
    } else if (columnIndex === NAME_COLUMN_INDEX) {
        cell.className = 'name-cell';
        cell.contentEditable = 'true';
    } else if (columnIndex === CARRY_OVER_COLUMN_INDEX) {
        cell.className = 'carry-over-cell';
        cell.contentEditable = 'true';
    } else if (columnIndex >= DAY_COLUMNS_START_INDEX && columnIndex < DAY_COLUMNS_START_INDEX + daysInMonth) {
        // Day cells are the columns that correspond to the current month days.
        cell.className = 'day-cell';
        cell.dataset.dayCol = columnIndex;
        cell.contentEditable = 'true';
    } else if (columnIndex === getTotalHoursColumnIndex()) {
        // Total hours shows computed shift hours for this row.
        cell.className = 'total-hours-cell';
        cell.textContent = '0';
    } else {
        cell.className = 'meta-cell';
        cell.contentEditable = 'true';
    }
}

/**
 * Find the workload cell inside a given employee row.
 * @param {HTMLTableRowElement} row
 * @returns {HTMLTableCellElement | null}
 */
function getWorkloadCell(row) {
    return row.querySelector('.workload-cell');
}

/**
 * Look up a day cell in a row using its stable day column index.
 * @param {HTMLTableRowElement} row
 * @param {number} columnIndex
 * @returns {HTMLTableCellElement | null}
 */
function getDayCell(row, columnIndex) {
    // day cells carry a data-day-col attribute for stable lookup instead of index arithmetic.
    return row.querySelector(`.day-cell[data-day-col="${columnIndex}"]`);
}

/**
 * Find the total hours cell in the given row.
 * @param {HTMLTableRowElement} row
 * @returns {HTMLTableCellElement | null}
 */
function getTotalHoursCell(row) {
    return row.querySelector('.total-hours-cell');
}

/**
 * Compute the column index of the total hours cell for the current month.
 * @returns {number}
 */
function getTotalHoursColumnIndex() {
    return DAY_COLUMNS_START_INDEX + daysInMonth;
}

/**
 * Calculate the total hours for an employee row from carry-over and assigned shifts.
 * @param {HTMLTableRowElement} row
 * @returns {number}
 */
function calculateHours(row) {
    let hours = 0;
    const carryOverCell = row.querySelector('.carry-over-cell');
    hours += parseFloat(carryOverCell ? carryOverCell.textContent : 0) || 0;

    row.querySelectorAll('.day-cell').forEach(cell => {
        const value = cell.textContent.trim();
        if (value === 'D' || value === 'N') {
            hours += 12;
        }
    });

    return hours;
}

/**
 * Render month headers and synchronize existing employee rows for the selected calendar month.
 * @param {number} year
 * @param {number} month
 */
function renderCalendar(year, month) {
    const dayRow = document.getElementById('day-row');
    const dayOfWeekRow = document.getElementById('day-of-week-row');
    const yearSpan = document.getElementById('year-span');
    const monthSpan = document.getElementById('month-span');

    dayRow.textContent = '';
    dayOfWeekRow.textContent = '';

    daysInMonth = new Date(year, month, 0).getDate();
    yearSpan.colSpan = daysInMonth;
    monthSpan.colSpan = daysInMonth;

    const firstCalendarDay = 1;
    const lastCalendarDay = daysInMonth;

    for (let emptyCell = 0; emptyCell < DAY_COLUMNS_START_INDEX; emptyCell++) {
        dayRow.appendChild(document.createElement('td'));
        dayOfWeekRow.appendChild(document.createElement('td'));
    }

    for (let calendarDay = firstCalendarDay; calendarDay <= lastCalendarDay; calendarDay++) {
        const dayHeaderCell = document.createElement('td');
        dayHeaderCell.className = 'calendar-day-header';
        dayHeaderCell.textContent = calendarDay;
        dayRow.appendChild(dayHeaderCell);

        const dayOfWeekCell = document.createElement('td');
        dayOfWeekCell.className = 'calendar-day-of-week';
        dayOfWeekCell.textContent = daysOfWeek[new Date(year, month - 1, calendarDay).getDay()];
        dayOfWeekRow.appendChild(dayOfWeekCell);
    }

    synchronizeRows(getTotalColumnCount());
}

/**
 * Refresh the calendar view when month or year selection changes.
 */
function updateCalendar() {
    const month = parseInt(document.getElementById('select-month').value, 10);
    const year = parseInt(document.getElementById('select-year').value, 10);
    renderCalendar(year, month);
}

/**
 * Append a fresh employee row to the calendar table.
 */
function addRow() {
    const tbody = document.querySelector('#calendar-table tbody');
    const employeeRow = document.createElement('tr');
    employeeRow.className = 'employee-row';

    for (let columnIndex = 0; columnIndex < getTotalColumnCount(); columnIndex++) {
        const cell = createCellForColumn(columnIndex);
        employeeRow.appendChild(cell);
    }

    tbody.appendChild(employeeRow);
}

/**
 * Ensure every employee row has the expected number of cells for the current month.
 * @param {number} newColCount
 */
function synchronizeRows(newColCount) {
    const employeeRows = document.querySelectorAll('.employee-row');

    employeeRows.forEach(row => {
        while (row.children.length < newColCount) {
            const columnIndex = row.children.length;
            const cell = createCellForColumn(columnIndex);
            row.appendChild(cell);
        }

        while (row.children.length > newColCount) {
            row.removeChild(row.lastChild);
        }

        Array.from(row.children).forEach((cell, columnIndex) => {
            applyColumnClass(cell, columnIndex);
        });
    });
}

/**
 * Assign post-night shift markers to the day after a night shift.
 * @param {NodeListOf<HTMLTableRowElement>} employeeRows
 * @param {number} dayColumnIndex
 */
function assignPostNightShifts(employeeRows, dayColumnIndex) {
    employeeRows.forEach(employeeRow => {
        const cell = getDayCell(employeeRow, dayColumnIndex);
        const prev = getDayCell(employeeRow, dayColumnIndex - 1);
        const prevValue = prev ? prev.textContent.trim() : '';
        if (prevValue === 'N' && cell) {
            cell.textContent = 'poN';
            updateCellColor(cell, 'poN');
        }
    });
}

/**
 * Return all rows that are available for assignment on a given day.
 * @param {NodeListOf<HTMLTableRowElement>} employeeRows
 * @param {number} columnIndex
 * @returns {HTMLTableRowElement[]}
 */
function getAvailablePeople(employeeRows, columnIndex) {
    return Array.from(employeeRows).filter(employeeRow => {
        const cell = getDayCell(employeeRow, columnIndex);
        const value = cell ? cell.textContent.trim() : '';
        return !['D', 'N', 'V', 'R', 'poN'].includes(value);
    });
}

/**
 * Sort employee rows by their workload ratio, breaking ties randomly.
 * @param {HTMLTableRowElement[]} people
 * @returns {HTMLTableRowElement[]}
 */
function sortPeopleByWorkload(people) {
    return people
        .map(row => {
            const workloadText = getWorkloadCell(row)?.textContent || '';
            const normalizedWorkload = workloadText.replace(',', '.');
            const parsedWorkload = parseFloat(normalizedWorkload);
            const workload = (!isNaN(parsedWorkload) && parsedWorkload > 0) ? parsedWorkload * 160 : 160;
            const currentHours = calculateHours(row);
            const ratio = currentHours / workload;
            const tier = Math.floor(ratio * 10);
            return {
                row,
                tier,
                ratio
            };
        })
        .sort((a, b) => {
            // First: sort by tier (0-10), ascending - lower tier (emptier) has priority
            if (a.tier !== b.tier) {
                return a.tier - b.tier;
            }

            // Second: within same tier, random tiebreaker
            return Math.random() - 0.5;
        })
        .map(item => item.row);
}

/**
 * Assign night and day shifts to a sorted list of available people.
 * @param {HTMLTableRowElement[]} availablePeople
 * @param {number} colIndex
 */
function assignShiftsToPeople(availablePeople, colIndex) {
    for (let i = 0; i < shiftRequirements.night && i < availablePeople.length; i++) {
        const cell = getDayCell(availablePeople[i], colIndex);
        if (cell) {
            cell.textContent = 'N';
            updateCellColor(cell, 'N');
        }
    }

    for (let i = shiftRequirements.night; i < shiftRequirements.night + shiftRequirements.day && i < availablePeople.length; i++) {
        const cell = getDayCell(availablePeople[i], colIndex);
        if (cell) {
            cell.textContent = 'D';
            updateCellColor(cell, 'D');
        }
    }
}

/**
 * Recalculate and update the total hours value for every employee row.
 * @param {NodeListOf<HTMLTableRowElement>} rows
 */
function updateHoursForAllRows(rows) {
    rows.forEach(row => {
        const totalCell = row.querySelector('.total-hours-cell');
        if (totalCell) {
            totalCell.textContent = calculateHours(row);
        }
    });
}

/**
 * Collect the indexes of columns that represent day cells in the current table.
 * @returns {number[]}
 */
function getDayColumnIndexes() {
    const firstRow = document.querySelector('.employee-row');
    if (!firstRow) {
        return [];
    }

    return Array.from(firstRow.children)
        .map((cell, index) => cell.classList.contains('day-cell') ? index : null)
        // Keep only actual day column indexes for the shift generation loop.
        .filter(index => index !== null);
}

/**
 * Generate shift assignments across the calendar by day.
 */
function generateShifts() {
    const employeeRows = document.querySelectorAll('.employee-row');
    const dayColumnIndexes = getDayColumnIndexes();

    dayColumnIndexes.forEach(dayColumnIndex => {
        assignPostNightShifts(employeeRows, dayColumnIndex);
        const available = getAvailablePeople(employeeRows, dayColumnIndex);
        const sorted = sortPeopleByWorkload(available);
        assignShiftsToPeople(sorted, dayColumnIndex);
    });

    updateHoursForAllRows(employeeRows);
}
