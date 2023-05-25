import API from './scripts/API.js';
import { reformatAgentInQueueReport, reformatNoteStatisticReport } from './scripts/csvReformatting.js';
import { transposeCsv, updateStatusBarMessage, getStatusBarMessage } from './scripts/utility.js';

let uploading = false;

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

    document.getElementById('agentInQueueSubmit').onclick = async (e) => {

        if (uploadInProgress(e.target)) return;

        if (agentInQueueChooser.files.length === 0) {
            updateStatusBarMessage("No Agent In Queue report chosen.");
        }

        for (let file of agentInQueueChooser.files) {

            uploading = true;
            updateStatusBarMessage(`Reformatting ${file.name}`);
            let csvText = await file.text();
            const formattedContent = reformatAgentInQueueReport(csvText);

            updateStatusBarMessage(`Sending record requests to knack`);
            await API.uploadAgentInQueueReport(formattedContent, (recordIndex, totalRecordsToSend) => {
                updateStatusBarMessage(`Sending create record request (${recordIndex} of ${totalRecordsToSend})`);
            });
            uploading = false;
            showFinishedUI(agentInQueueChooser);
        }
    }

    document.getElementById('noteStatsSubmit').onclick = async (e) => {

        if (uploadInProgress(e.target)) return;

        if (noteStatsChooser.files.length === 0) {
            updateStatusBarMessage("No Note Statistic report chosen.");
        }

        for (let file of noteStatsChooser.files) {
            
            uploading = true;
            updateStatusBarMessage(`Reformatting ${file.name}`);
            const csvText = await file.text();
            const transposedCsv = transposeCsv(csvText);
            const formattedContent = reformatNoteStatisticReport(transposedCsv);

            updateStatusBarMessage(`Sending record requests to knack`);
            await API.uploadNoteStatisticReport(formattedContent, (recordIndex, totalRecordsToSend) => {
                updateStatusBarMessage(`Sending create record request (${recordIndex} of ${totalRecordsToSend})`);
            });
            showFinishedUI(noteStatsChooser);
        }
    }
};

function uploadInProgress(button) {
    if (uploading) {
        updateStatusBarMessage('Upload already in progress.');
        button.classList.remove('rejectUpload');
        setTimeout(() => button.classList.add('rejectUpload'), 0);
    }

    return uploading;
}

function showFinishedUI(fileChooser) {
    fileChooser.value = "";
    fileChooser.classList.remove('hasFile');
    fileChooser.nextSibling.nextSibling.classList.remove('hasFileBtn');
    
    updateStatusBarMessage('Done!');
    uploading = false;
}