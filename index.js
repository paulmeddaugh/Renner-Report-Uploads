import API from './scripts/API.js';
import { reformatAgentInQueueReport, reformatNoteStatisticReport } from './scripts/csvReformatting.js';
import { transposeCsv } from './scripts/utility.js';

window.onload = () => {

    // const headers = {
    //     'apiId': '6303cfdae045d500211ad909',
    //     'apiKey': 'd2c92677-fc10-4443-9045-3a04854c5612',
    //     'Content-Type': 'application/json'
    // }

    // fetch('https://api.knack.com/v1/objects/object_29/records', { method: 'POST', headers, body: JSON.stringify({ field_318: 11 }) }).then(async response => {
    //     console.log(await response.json());
    // });

    const agentInQueueChooser = document.getElementById("agentInQueueFile");
    const noteStatsChooser = document.getElementById("noteStatsFile");

    agentInQueueChooser.onchange = noteStatsChooser.onchange = (e) => {
        if (e.target.value) {
            e.target.classList.add('hasFile');
            e.target.nextSibling.nextSibling.classList.add('hasFileBtn');
        } else {
            e.target.classList.remove('hasFile');
            e.target.nextSibling.nextSibling.classList.remove('hasFileBtn');
        }
    }

    document.getElementById('agentInQueueSubmit').onclick = async () => {

        if (agentInQueueChooser.files.length === 0) {
            alert("No Agent In Queue report chosen.");
        }

        for (let file of agentInQueueChooser.files) {

            let csvText = await file.text();
            const formattedContent = reformatAgentInQueueReport(csvText);

            await API.uploadAgentInQueueReport(formattedContent);
        }
    }

    document.getElementById('noteStatsSubmit').onclick = async () => {

        if (noteStatsChooser.files.length === 0) {
            alert("No Note Statistic report chosen.");
        }

        for (let file of noteStatsChooser.files) {
            
            const csvText = await file.text();
            const transposedCsv = transposeCsv(csvText);
            console.log(transposedCsv);
            const formattedContent = reformatNoteStatisticReport(transposedCsv);
            console.log(formattedContent);

            await API.uploadNoteStatisticReport(formattedContent);
        }
    }
};