import API from './scripts/API.js';
import { reformatAgentInQueueReport, reformatNoteStatisticReport } from './scripts/csvReformatting.js';
import { transposeCsv, updateStatusBarMessage, getStatusBarMessage, getLogMessage, appendLogMessage, appendLogElement } from './scripts/utility.js';

let uploading = false;

window.onload = async () => {

    const agentInQueueChooser = document.getElementById("agentInQueueFile");
    const noteStatsChooser = document.getElementById("noteStatsFile");
    const totalStatsChooser = document.getElementById("totalStatsFile");
    const tvStatsChooser = document.getElementById('tvStatsFile');

    // UI color change when a file is selected
    agentInQueueChooser.onchange = noteStatsChooser.onchange = totalStatsChooser.onchange = tvStatsChooser.onchange = (e) => {
        if (e.target.value) {
            e.target.classList.add('hasFile');
            e.target.nextSibling.nextSibling.classList.add('hasFileBtn');
        } else {
            e.target.classList.remove('hasFile');
            e.target.nextSibling.nextSibling.classList.remove('hasFileBtn');
        }
    }

    addUploadReportClickListener(
        document.getElementById('agentInQueueSubmit'),
        agentInQueueChooser,
        async (file) => {
            let csvText = await file.text();
            const reformattedCsv = reformatAgentInQueueReport(csvText);
            await API.uploadAgentInQueueReport(reformattedCsv, (statusMessage, logMessage, info) => {
                uploadStatus(statusMessage, logMessage);
            });
        }
    )

    addUploadReportClickListener(
        document.getElementById('noteStatsSubmit'),
        noteStatsChooser,
        async (file) => {
            const csvText = await file.text();
            const transposedCsv = transposeCsv(csvText);
            const formattedContent = reformatNoteStatisticReport(transposedCsv);
            await API.uploadNoteStatisticReport(formattedContent, (statusMessage, logMessage, info) => {
                uploadStatus(statusMessage, logMessage);
            });
        }
    )

    addUploadReportClickListener(
        document.getElementById('totalStatsSubmit'), 
        totalStatsChooser, 
        async (file) => {
            const xlsxArr = await readXlsxFile(file);
            await API.uploadTotalInteractionReport(xlsxArr, file.name, (statusMessage, logMessage, info) => {
                uploadStatus(statusMessage, logMessage);
            });
        }
    );

    addUploadReportClickListener(
        document.getElementById('tvStatsSubmit'),
        tvStatsChooser,
        async (file) => {
            const xlsxArr = await readXlsxFile(file);
            await API.uploadProgramResponseReport(xlsxArr, file.name, (statusMessage, logMessage, info) => {
                uploadStatus(statusMessage, logMessage);
            });
        }
    )

    document.getElementById('callLoopStatsButton').onclick = (e) => {
        window.open(e.target.getAttribute('href'), '_blank');
    }
};

/**
 * Added an onclick listener to the passed in submit button that retrieves the file of an 'input' file type element, and calls a function with the File object as a parameter.
 * Takes care of boiler plate code of error handling, status logs, and UI cleanup once a file has been uploaded.
 * 
 * @param {*} submitButton The button element to add the click listener to.
 * @param {*} fileCallback An asyncronous possible function that recieves the first File object from the 'file' typed input element as a parameter.
 */
function addUploadReportClickListener(submitButton, fileChooser, fileCallback) {
    submitButton.onclick = async (e) => {

        if (uploadInProgress(e.target)) return;

        if (fileChooser.files.length === 0) {
            const reportTypeName = ({
                'agentInQueueSubmit': 'Agent In Queue',
                'noteStatsSubmit': 'Note Statistic',
                'totalStatsSubmit': 'Total Statistic',
                'tvStatsSubmit': 'Program Response',
            })[submitButton.id];

            updateStatusBarMessage(`No ${reportTypeName} report chosen.`);
        }

        for (let file of fileChooser.files) {
            uploading = true;
            updateStatusBarMessage(`Reformatting and parsing ${file.name}`);
            await fileCallback?.(file);
            showFinishedUI(fileChooser);
        }
    }
}

function uploadStatus(statusMessage, logMessage) {
    if (statusMessage) updateStatusBarMessage(statusMessage);
    if (logMessage) appendLogMessage(`${logMessage}`);
}

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
    appendLogMessage('Done!');
    uploading = false;
}