import { getNextLineIndex } from './utility.js';

const agentInQueueHeaders = 'Agent Extension,Agent,,Queue Extension,Queue Name,,Total Logged in Time,Calls Answered,% Calls Serviced,Answered Per Hour,Ring Time Total,Ring Time Mean,Talk Time Total,Talk Time Mean,Date';

export function reformatAgentInQueueReport (content) {
    // Goes to third line
    let i = getNextLineIndex(content, getNextLineIndex(content, 0));

    // Extracts report start date
    let date = new Date(content.substring(i + 5, i = content.indexOf('M', i + 5) + 1));
    const firstDateString = date.toLocaleString().replace(',', '');

    // Extracts report end date
    date = new Date(content.substring(i + 4, i = content.indexOf('M', i + 4) + 1));
    const knackDateString = `${firstDateString} to ${date.toLocaleString().replace(',', '')}`;

    // Skips to report rows
    for (let a = 0; a < 6; a++) { i = getNextLineIndex(content, i); }

    // Reformats row data
    content = content
        .replace(new RegExp(/\n/g), `,${knackDateString}\n`) // inserts date at end
        .replace(new RegExp(/ - /g), ','); // separates agent extension and agent name
    content = content.slice(0, content.indexOf('Total:') - 1); // Removes 'total' row and 3CX signature row

    return agentInQueueHeaders + '\n' + content.substring(getNextLineIndex(content, i)).replace(new RegExp(/\r/g), '');
}

export function reformatNoteStatisticReport (csvText) {
    // Assumes the .csv text has already been transposed, such as with the transposeCsv function in utility.js

    // Merges the header row with second row
    const secondLineIndex = String(csvText).indexOf('\n') + 1;
    const secondLineEnd = String(csvText).indexOf('\n', secondLineIndex) + 1;

    let count1 = csvText.indexOf(',') + 1; // skips first header
    let count2 = csvText.indexOf(',', secondLineIndex + 1) + 1; // skips first column of second row
    let newHeaders = '3CX Username, ';

    // Loops through the columns in both rows and concats together
    do {
    // Gets first row data
    const count1End = csvText.indexOf(',', count1);
    const lastHeader = count1End >= secondLineIndex;
    const firstRowData = !lastHeader 
        ? csvText.substring(count1, count1End)
        : csvText.substring(count1, csvText.indexOf('\n', count1) - 1); // gets last column
    count1 = count1End + 1;

    // Gets second row data
    const count2End = csvText.indexOf(',', count2);
    const secondRowData = !lastHeader
        ? csvText.substring(count2, count2End)
        : csvText.substring(count2, csvText.indexOf('\n', count2) - 1); // gets last column
    count2 = count2End + 1;

        newHeaders += `${firstRowData}${secondRowData !== '' ? ` - ${secondRowData}` : ''}${!lastHeader ? ', ' : ''}`;
    } while (count1 < secondLineIndex && count2 < secondLineEnd)

    return newHeaders + '\n' + csvText.substring(secondLineEnd).replace(new RegExp(/\r/g), '');
}