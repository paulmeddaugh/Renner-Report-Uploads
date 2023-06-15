import API from './scripts/API.js';
import { reformatAgentInQueueReport, reformatNoteStatisticReport } from './scripts/csvReformatting.js';
import { transposeCsv, updateStatusBarMessage, getStatusBarMessage, getLogMessage, appendLogMessage, appendLogElement } from './scripts/utility.js';

let uploading = false, userLoggedIn = false, loggedInLoadResult = null;

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

    // Checks if user logs out or in
    const observer = new MutationObserver((mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.addedNodes?.length) for (let node of mutation.addedNodes) {
                if (node?.id === 'view_89') { // no user logged in
                    setLoggedIn(false);
                }
                if (node?.id === 'view_164') { // user logged in
                    setLoggedIn(true);
                }
            }
        }
    });
    const targetNode = document.getElementById("knack-dist_2");
    observer.observe(targetNode, { attributes: true, childList: true, subtree: true });

    // Checks if user is initially logged in or out
    const observer2 = new MutationObserver((mutationList, observer) => {
        for (const mutation of mutationList) {
            if (loggedInLoadResult === null) {
                loggedInLoadResult = false;
            } else if (!loggedInLoadResult) {
                if (document.getElementById('view_89')) {
                    setLoggedIn(false);
                }
                loggedInLoadResult = true;
            }
        }
    });

    // Start observing the target node for configured mutations
    observer2.observe(targetNode, { attributes: true, subtree: true });
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

        if (!userLoggedIn) {
            alert('Must be logged in to Partner Care to upload a report.');
        }

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

function setLoggedIn(loggedIn) {

    if (loggedIn === userLoggedIn) return;

    userLoggedIn = loggedIn;
    const main = document.getElementsByTagName('main')[0];
    main.style.height = (loggedIn) ? 'auto' : '0';
    main.style.overflow = (loggedIn) ? 'unset' : 'hidden';
}