export function getNextLineIndex(content, charIndex) {
    const nextSlashN = String(content).indexOf('\n', charIndex) + 1;
    return nextSlashN ? nextSlashN : String(content).length;
}

// Formats a date to a string in the form of '03/04/2023 3:00pm' 
export function getKnackDateString(date) {
    const dateString = date.toLocaleString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeString = String(date.toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' })).toLowerCase();

    return `${dateString} ${timeString.slice(0, -3)}${timeString.slice(-2).toLowerCase()}`;
}

export function transposeCsv (csv) {
    const indices = [];
    let newCsv = '';
    
    // Gets starting indices from '\n'
    let i = 0, nextLineIndex = 0;
    do {
        indices[i++] = nextLineIndex;
        nextLineIndex = csv.indexOf('\n', nextLineIndex) + 1;
    } while (nextLineIndex)
    
    
    const secondLineIndexStart = indices[1]; // stores to easily determine if at row end
    do {
        // Determines if column data ends at ',' or '\n'
        const searchChar = csv.indexOf(',', indices[0]) < secondLineIndexStart ? ',' : '\n';

        for (let i = 0; i < indices.length; i++) {
            const index = indices[i];
            const delimeterToAdd = (i === indices.length - 1) ? '\n' : ',';
            const columnEndIndex = csv.indexOf(searchChar, index)
            const columnData = csv.substring(index, columnEndIndex !== -1 ? columnEndIndex : csv.length);
            newCsv += `${columnData}${delimeterToAdd}`;
            indices[i] = columnEndIndex + 1;
        }
    } while (indices[0] < secondLineIndexStart);
    
    newCsv = newCsv.substring(0, newCsv.length - 1);
    
    return newCsv;
}

let statusBar;
window.addEventListener("load", () => {
    statusBar = document.getElementById('statusBar');
    statusBar.innerHTML = '';
});

export function getStatusBarMessage() {
    return statusBar.innerHTML;
}

export function updateStatusBarMessage(message) {
    statusBar.innerHTML = message;
}