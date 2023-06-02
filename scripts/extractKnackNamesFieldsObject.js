// A code snippet (for inspector, Sources > 'Snippets' on far left. Save code in new snippet then right click > run) 
// for the 'Records' section page in the knack builder. Logs a string for an object that maps all name keys to field values.

let str = '{';

for (let fieldEl of document.getElementById('kn-records-table').children[0].children[0].children[1].children[0].children[0].children[0].children) {
    const name = fieldEl.children[0]?.getElementsByTagName('span')[0]?.innerHTML;
    const field = String(fieldEl.children[0]?.getAttribute('data-cy')).slice(14);

    if (name) str += `'${name}': '${field}',`;
}

str = str.substring(0, str.length - 1) + '}';
console.log(str);