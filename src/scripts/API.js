import axios from 'axios';
import { getNextLineIndex } from './utility.js';

const agentInQueueFields = { // Call Statistics
    "Agent Extension": "field_318",
    "Agent": "field_319",
    "Agent Text": 'field_510',
    "Queue Extension": "field_320",
    "Queue Name": "field_321",
    "Total Logged in Time": "field_322",
    "Calls Answered": "field_323",
    "% Calls Serviced": "field_324",
    "Answered Per Hour": "field_325",
    "Ring Time Total": "field_326",
    "Ring Time Mean": "field_327",
    "Talk Time Total": "field_328",
    "Talk Time Mean": "field_329",
    "Date": "field_330",
}

const noteStatFields = { '3CX Username': 'field_218', '3CX Username Text': 'field_509', 'Inbound Call - Finance': 'field_219','Inbound Call - Free Offer': 'field_220','Inbound Call - Material Request': 'field_221','Inbound Call - Ministry Expansion': 'field_222','Inbound Call - Order/Donation': 'field_223','Inbound Call - Other': 'field_224','Inbound Call - Praise Report': 'field_225','Inbound Call - Prayer': 'field_226','Inbound Call - Prayer for Infilling of HS': 'field_227','Inbound Call - Prayer for Salvation': 'field_228','Inbound Email - Free Offer': 'field_229','Inbound Email - Order Fulfillment': 'field_230','Inbound Email - Other': 'field_231','Inbound Email - Prayer': 'field_232','Inbound Email - prayer@deniserenner.org': 'field_233','Outbound Call - Call from a Letter': 'field_244','Outbound Call - Death in Family': 'field_245','Outbound Call - Disaster': 'field_246','Outbound Call - Faithful': 'field_247','Outbound Call - Finance': 'field_248','Outbound Call - Follow-up': 'field_249','Outbound Call - Free Offer': 'field_250','Outbound Call - Holiday': 'field_251','Outbound Call - Lapsed': 'field_252','Outbound Call - Large Donor': 'field_253','Outbound Call - Meeting New Name': 'field_254','Outbound Call - Ministry Expansion': 'field_255','Outbound Call - New Donor': 'field_256','Outbound Call - NNPPC': 'field_257','Outbound Call - Orders/Donations': 'field_258','Outbound Call - Other': 'field_259','Outbound Call - Prayer': 'field_260','Outbound Call - Reconnect': 'field_261','Outbound Call - Relief': 'field_262','Outbound Email - CFL': 'field_263','Outbound Email - Disaster': 'field_264','Outbound Email - Faithful': 'field_265','Outbound Email - Finance': 'field_266','Outbound Email - Follow-up': 'field_267','Outbound Email - Holiday': 'field_268','Outbound Email - Lapsed': 'field_269','Outbound Email - Large Donor': 'field_270','Outbound Email - Ministry Expansion': 'field_271','Outbound Email - NNC': 'field_272','Outbound Email - NNPPC': 'field_273','Outbound Email - Order Fulfillment': 'field_274','Outbound Email - Other': 'field_275','Outbound Email - Prayer@renner': 'field_276','Outbound Email - Reconnect': 'field_277','Outbound Email - Relief': 'field_278','Outbound Email - Response': 'field_279','Outbound Mail - Card': 'field_280','Outbound Mail - Follow-up': 'field_281','Outbound Mail - Mini Book': 'field_282','Outbound Mail - Ministry Expansion': 'field_283','Outbound Mail - Other': 'field_284','Outbound Mail - PC Prayer Only': 'field_285','Outbound Mail - PC w/ Gift': 'field_286','Outbound Mail - Postcard': 'field_287' };

// Maps to Total Interaction Statistic Report category and subcategory names in the report, not the actual names in knack
const totalInteractionFields = {'Month/Year': 'field_375','Work Days Manual': 'field_454','inbound calls - donation/order': 'field_445','inbound calls - finance': 'field_376','inbound calls - free offer press 7': 'field_377','inbound calls - front desk routed': 'field_446','inbound calls - material request': 'field_378','inbound calls - ministry expansion': 'field_379','inbound calls - order/donation': 'field_380','inbound calls - other': 'field_381','inbound calls - praise report': 'field_382','inbound calls - prayer': 'field_383','inbound calls - prayer for infilling of hs': 'field_384','inbound calls - prayer for salvation': 'field_385','inbound email - free offer': 'field_386','inbound email - order fulfillment': 'field_387','inbound email - other': 'field_388','inbound email - prayer': 'field_389','inbound email - prayer@deniserenner.org': 'field_390','outbound calls - call from a letter': 'field_391','outbound calls - death in family': 'field_392','outbound calls - disaster': 'field_393','outbound calls - faithful': 'field_394','outbound calls - finance': 'field_395','outbound calls - follow-up': 'field_396','outbound calls - free offer': 'field_397','outbound calls - holiday': 'field_398','outbound calls - lapsed': 'field_399','outbound calls - large donor': 'field_400','outbound calls - meeting new name': 'field_401','outbound calls - ministry expansion project': 'field_402','outbound calls - new partner': 'field_403','outbound calls - nnppc (new purchaser)': 'field_404','outbound calls - orders/donations (voicemail response)': 'field_405','outbound calls - other': 'field_406','outbound calls - prayer': 'field_407','outbound calls - reconnect/reactivate follow-up': 'field_408','outbound calls - relief project': 'field_409','outbound email - call from letter - email': 'field_410','outbound email - disaster': 'field_411','outbound email - faithful': 'field_412','outbound email - finance': 'field_413','outbound email - follow-up': 'field_414','outbound email - holiday': 'field_415','outbound email - lapsed': 'field_416','outbound email - large donor': 'field_417','outbound email - ministry expansion project': 'field_418','outbound email - new partners': 'field_419','outbound email - nnppc (new product purchaser)': 'field_420','outbound email - order fulfillment': 'field_421','outbound email - other': 'field_422','outbound email - prayer@renner.org': 'field_423','outbound email - reconnect': 'field_424','outbound email - relief project': 'field_425','outbound email - response': 'field_426','outbound mail - card': 'field_427','outbound mail - follow-up': 'field_428','outbound mail - mini book': 'field_429','outbound mail - ministry expansion': 'field_430','outbound mail - other': 'field_431','outbound mail - pc prayer only - letter': 'field_432','outbound mail - pc w/ gift': 'field_433','outbound mail - postcard': 'field_434','outbound mail - reconnect': 'field_444',' pdinbound calls - order issue': 'field_435',' pdinbound calls - other': 'field_436','inbound calls total': 'field_437','averageinbound calls per day': 'field_457','inbound email total': 'field_438','outbound calls total': 'field_439','averageoutbound calls per day': 'field_458','outbound email total': 'field_440','averageoutbound email per day': 'field_456','outbound mail total': 'field_441','averageoutbound mail per day': 'field_455','total responses': 'field_442','average total responses per day': 'field_459', 'digital outreach - auto-calls': 'field_512', 'digital outreach - video emails': 'field_513' };
const totalInteractionHeaders = ['outbound mail', 'outbound email', 'inbound calls', 'outbound calls', 'digital outreach'];

const callLoopFields = { 'Total': 'field_508', 'Source': 'field_519', 'Date/Time': 'field_505' };
const bombbombFields = { 'Sent': 'field_515', 'Source': 'field_520', 'Date/Time': 'field_521' };

// Maps to the columns in the TV Response Analysis Report, not the actual field names in knack
const tvStatFields = {'Broadcast Week': 'field_470','Air Date': 'field_471','# of Programs': 'field_472','Program Name': 'field_473','SG Downloaded': 'field_474','SG Sold': 'field_475',"Series Sold": 'field_476','Product Offer': 'field_477','Sold': 'field_478','Price': 'field_486','Price 2': 'field_498','Free Resource Offered': 'field_480','Free Resource Offered Text': 'field_497','Total Given Away': 'field_481','Ministry Stand up': 'field_482','Incoming Calls': 'field_483','Incoming Calls 2': 'field_496','Free Product Offer When Aired': 'field_484', 'Rerun of': 'field_494'};

const RATE_LIMIT_DELAY_EVERY = 6; 
const RATE_LIMIT_DELAY = 3150;

const knackAppId = app_id; // In a script just above ./src/dist/main.js script in index.html, gotten when copying the knack project's embedded script

const API = {

    employeeIdMap: {},
    programNameMap: {},
    productOfferMap: {},

    getAllEmployees() { 
        return new Promise((resolve, reject) => {
            axios.get(`/.netlify/functions/get-records?type=employees&knackAppId=${knackAppId}`).then((response) => {
                resolve(response.data.records);
            }).catch((response) => {
                reject(`${response.data?.message}\n${response.data?.status}`);
            });
        });
        // View based request, gets max of 1_000 employees
        ////// needs session key
        // axios.get('https://api.knack.com/v1/pages/scene_1/views/view_150/records?page=1&rows_per_page=1000').then(() => {

        // });
    },

    async getAllEmployeeIds() {
        const employees = await this.getAllEmployees();

        if (!Array.isArray(employees)) {
            alert(employees);
        }

        const employeeMap = new Proxy({}, {
            get(obj, prop, reciever) {
                // Attempts to find id by 3CX name ([first letter of first name + last name]) if not found
                const threeCXname = String(prop[0] + prop?.substring(prop?.indexOf(' ') + 1)).toLowerCase();
                return (obj[prop]) ? obj[prop] : obj[threeCXname];
            }
        });

        for (let employee of employees) {
            const employeeName = String(employee.field_41);
            const threeCXname = String(employeeName[0] + employeeName?.substring(employeeName?.indexOf(' ') + 1)).toLowerCase();
            employeeMap[threeCXname] = employee.id;
        }
        return employeeMap;
    },

    async getAllTvResponseProductOffers() {
        const tvResponses = await new Promise((resolve, reject) => {
            axios.get(`/.netlify/functions/get-records?type=tvResponses&knackAppId=${knackAppId}`).then((response) => {
                resolve(response.data.records);
            }).catch((response) => {
                reject(`${response.data?.message}\n${response.data?.status}`);
            });
        });

        if (!Array.isArray(tvResponses)) {
            alert('Current TV Responses did not load. Please load the page again if planning to upload a TV Response report.');
        }

        let programNameMap = {}, productOfferMap = {};
        for (let tvResponse of tvResponses) {
            const programName = String(tvResponse[tvStatFields['Program Name']]).toLowerCase();
            programNameMap[programName] = tvResponse.id;

            const productOfferName = String(tvResponse[tvStatFields['Product Offer']]).toLowerCase();
            productOfferMap[productOfferName] = tvResponse.id;
        }
        return [programNameMap, productOfferMap];
    },

    async uploadAgentInQueueReport(csvText, updateUICallback) {
        return this.uploadCsvReport(csvText, 'Agent In Queue', updateUICallback);
    },

    async uploadNoteStatisticReport(csvText, updateUICallback) {
        return this.uploadCsvReport(csvText, 'Note Statistic', updateUICallback);
    },

    /**
     * Assumes there are csv headers in csvText
     * 
     * @param {string} csvText 
     */
    async uploadCsvReport(csvText, type, updateUICallback) {
        const headers = csvText.substring(0, getNextLineIndex(csvText, 0) - 1).split(',');
        // console.log(headers);

        let requestQueue = [], i = 0;
        while ((i = getNextLineIndex(csvText, i)) < csvText.length) {

            const nextLineEndIndex = getNextLineIndex(csvText, i);
            const nextLineData = csvText.substring(i, nextLineEndIndex !== csvText.length ? nextLineEndIndex - 1 : nextLineEndIndex).split(',');
            // console.log(nextLineData.join(','));

            const newRecordObject = {};
            for (let columnIndex = 0; columnIndex < nextLineData.length; columnIndex++) {
                const header = String(headers[columnIndex]).trim();
                const field = ({
                    'Agent In Queue': agentInQueueFields[header],
                    'Note Statistic': noteStatFields[header],
                })[type];

                if (!field) continue;

                if (header.includes('Date')) {
                    const toIndexStart = nextLineData[columnIndex].indexOf(' to');
                    const fromDate = new Date(nextLineData[columnIndex].substring(0, toIndexStart));
                    const toDate = new Date(nextLineData[columnIndex].substring(toIndexStart + 4));
                    
                    // Converts date to an object format that will go into knack
                    nextLineData[columnIndex] = createKnackToFromDateObject(fromDate, toDate);
                } else if (header === 'Agent' || header === '3CX Username') {

                    // Stores simple employee name text in another field
                    newRecordObject[header === 'Agent' ? agentInQueueFields['Agent Text'] : noteStatFields['3CX Username Text']] 
                        = String(nextLineData[columnIndex]).toLowerCase();

                    nextLineData[columnIndex] = this.employeeIdMap[String(nextLineData[columnIndex]).toLowerCase()];
                }

                newRecordObject[field] = nextLineData[columnIndex];
            }

            const netlifyType = ({
                'Agent In Queue': 'CallStatistic',
                'Note Statistic': 'NoteStatistic',
            })[type];

            requestQueue.push({
                url: `/.netlify/functions/create-record?type=${netlifyType}&knackAppId=${knackAppId}`,
                data: JSON.stringify(newRecordObject)
            });
        }

        await postRequestsEvery(requestQueue, RATE_LIMIT_DELAY / RATE_LIMIT_DELAY_EVERY, updateUICallback);
    },

    async uploadTotalInteractionReport(xlsxArray, filename, updateUICallback) {

        updateUICallback?.(null, `Parsing ${filename}`);

        const requestQueue = [], callLoopQueue = [], bombbombQueue = [];
        const year = Number(filename.substring(0, 4));

        for (let column = 1; column < 13; column++) {
            let newRecord = {};

            let category = null, workDays = null;

            let skipRows = [1];

            for (let row = 0, len = xlsxArray.length; row < len; row++) {

                if (skipRows.includes(row)) continue;
                
                if (row === 0) { // month row
                    const firstOfMonth = new Date(`${String(xlsxArray[row][column]).trim()}, ${year}`);
                    const daysInMonth = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth() + 1, 0).getDate();
                    const lastOfMonth = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), daysInMonth);
                    
                    newRecord[totalInteractionFields['Month/Year']] = createKnackToFromDateObject(firstOfMonth, lastOfMonth, false);
                    continue;
                }

                if (row === 2) { // workdays row
                    const text = xlsxArray[row][column];
                    const actualIndex = text.indexOf('actual');
                    workDays = (actualIndex === -1) ? Number(text.substring(0, text.indexOf(' '))) : text.substring(text.indexOf('(') + 1, actualIndex - 1);

                    newRecord[totalInteractionFields['Work Days Manual']] = Number(workDays);
                    continue;
                }

                if (totalInteractionHeaders.includes(String(xlsxArray[row][0]).toLowerCase())) {
                    category = String(xlsxArray[row][0]).toLowerCase();
                    continue;
                } else if (String(xlsxArray[row][0]).includes(`Total ${category}`)) {
                    category = null;
                }

                if (category === null) continue;

                // Subcategory row
                const subcategory = String(xlsxArray[row][0]).toLowerCase();
                const fieldName = `${category} - ${subcategory}`.trim();
                const field = totalInteractionFields[fieldName];

                newRecord[field] = xlsxArray[row][column];
            }

            callLoopQueue.push({ 
                url: `/.netlify/functions/create-record?type=CallLoopStatistic&knackAppId=${knackAppId}`,
                data: {
                    [callLoopFields['Date/Time']]: newRecord[totalInteractionFields['Month/Year']],
                    [callLoopFields['Total']]: newRecord[totalInteractionFields['digital outreach - auto-calls']],
                    [callLoopFields['Source']]: 'Total Interaction Statistic Report'
                }
            });
            bombbombQueue.push({
                url: `/.netlify/functions/create-record?type=BombbombStatistic&knackAppId=${knackAppId}`,
                data: {
                    [bombbombFields['Date/Time']]: newRecord[totalInteractionFields['Month/Year']],
                    [bombbombFields['Sent']]: newRecord[totalInteractionFields['digital outreach - video emails']],
                    [bombbombFields['Source']]: 'Total Interaction Statistic Report',
                }
            })
            
            requestQueue.push({ url: `/.netlify/functions/create-record?type=TotalInteractionStatistic&knackAppId=${knackAppId}`, data: newRecord });
        }

        await postRequestsEvery(requestQueue, RATE_LIMIT_DELAY / RATE_LIMIT_DELAY_EVERY, updateUICallback);
        
        updateUICallback?.(`Sending Call Loop Statistic record requests.`, `Sending Call Loop Statistic record requests.`);
        await postRequestsEvery(callLoopQueue, RATE_LIMIT_DELAY / RATE_LIMIT_DELAY_EVERY, updateUICallback);

        updateUICallback?.(`Sending Bombbomb Statistic record requests.`, `Sending Bombbomb Statistic record requests.`);
        await postRequestsEvery(bombbombQueue, RATE_LIMIT_DELAY / RATE_LIMIT_DELAY_EVERY, updateUICallback);
    },
    
    async uploadProgramResponseReport (xlsxArray, filename, updateUICallback) {

        updateUICallback?.(null, `Parsing ${filename}`);

        const requestQueue = [], responses = [];
        const year = Number(filename.substring(0, 4));
        const headers = xlsxArray[0];
        const monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
        let broadcastWeek = '', startDate, endDate;

        for (let row = 2; row < xlsxArray.length; row++) {
            let newRecord = {};
            
            for (let column = 0; column < headers.length; column++) {

                const data = xlsxArray[row][column];
                const header = headers[column];

                if (monthNames.includes(data)) break; // Skips rows with Month headers
                if (String(data).trim() === 'n/a') continue; // Skips columns with 'n/a'

                newRecord[tvStatFields[header]] = ({
                    'Broadcast Week': () => {
                        if (data !== null) {
                            return broadcastWeek = xlsxArray[row][column];
                        } else {
                            // Columns 0-6 will be empty and expect the same broadcast weeks and dates as before
                            newRecord[tvStatFields['Air Date']] = createKnackToFromDateObject(startDate, endDate, false);
                            column = 6;
                            return broadcastWeek;
                        }
                    },
                    'Air Date': () => {
                        // Creates a knack date object from formatting
                        startDate = new Date(`${data.substring(0, data.indexOf('-'))}, ${year}`);
                        const afterHyphen = data.substring(data.indexOf('-') + 1);
                        endDate = (Number.isNaN(Number(afterHyphen))) ?
                              new Date(`${afterHyphen}, ${year}`)
                            : new Date(`${startDate.getMonth() + 1} ${afterHyphen}, ${year}`);
                        
                        return createKnackToFromDateObject(startDate, endDate, false);
                    },
                    'Program Name': () => {
                        newRecord[tvStatFields['Rerun of']] = API.programNameMap[String(data).toLowerCase()]; // '~~~' placeholder, actual id, or undefined
                        mapProgramName(data);
                    },
                    'Product Offer': () => {
                        mapProductOffer(data);
                    },
                    'Price': () => {
                        const slashValue = getValueAfterSlash(data);
                        if (slashValue) {
                            newRecord[tvStatFields['Price 2']] = slashValue;
                            return String(data).substring(0, String(data).indexOf(slashValue) - 1);
                        }
                    },
                    'Free Resource Offered': () => {
                        newRecord[tvStatFields['Free Resource Offered Text']] = data;
                        mapProductOffer(data);
                    },
                    'Incoming Calls': () => {
                        const slashValue = getValueAfterSlash(data);
                        if (slashValue) {
                            newRecord[tvStatFields['Incoming Calls 2']] = slashValue;
                            return String(data).substring(0, String(data).indexOf(slashValue) - 1);
                        }
                    }
                })[header]?.() ?? data;

            }
            
            if (!Object.keys(newRecord).length) continue;
            
            requestQueue.push({ url: `/.netlify/functions/create-record?type=TVResponse&knackAppId=${knackAppId}`, data: newRecord });
        }

        function getValueAfterSlash(data) {
            let slashIndex = String(data).indexOf('/');
            if (slashIndex === -1) slashIndex = String(data).indexOf('\\');

            return (slashIndex !== -1) ? String(data).substring(slashIndex + 1) : null;
        }

        function mapProductOffer(productOffer) {
            const productOfferId = API.productOfferMap[String(productOffer).toLowerCase()];
            
            // Placeholder for record id's not yet created; id stored in recordCallback below, and replaced in beforeRequestCallback below
            if (!productOfferId) {
                API.productOfferMap[String(productOffer).toLowerCase()] = '~~~';
            }
        }

        function mapProgramName(programName) {
            const programNameId = API.programNameMap[String(programName).toLowerCase()];
            
            // Placeholder for record id's not yet created; id stored in recordCallback below, and replaced in beforeRequestCallback below
            if (!programNameId) {
                API.programNameMap[String(programName).toLowerCase()] = '~~~';
            }
        }

        // Wraps updateUICallback, and replaces '~~~' placeholders in API.productOfferMap and API.programNameMap after a record is successfully created
        const responseCallback = (statusMessage, logMessage, response) => {

            updateUICallback?.(statusMessage, logMessage, response);

            if (response?.data && !response?.data?.errors) {
                const recordCreated = response.data;

                const productOffer = String(recordCreated[tvStatFields['Product Offer']]).toLowerCase();
                if (API.productOfferMap[productOffer] === '~~~') {
                    API.productOfferMap[productOffer] = recordCreated.id;
                }

                const programName = String(recordCreated[tvStatFields['Program Name']]).toLowerCase();
                if (API.programNameMap[programName] === '~~~') {
                    API.programNameMap[programName] = recordCreated.id;
                }
            }
        }

        const beforeRequestCallback = (newRecord) => {
            // Replaces '~~~' placeholders with record ids for 'Rerun of' and 'Free Resource Offered' fields
            if (newRecord[tvStatFields['Rerun of']] === '~~~') {
                const programName = String(newRecord[tvStatFields['Program Name']]).toLowerCase();
                const id = API.programNameMap[programName];

                newRecord[tvStatFields['Rerun of']] = id;
            }
            if (newRecord[tvStatFields['Free Resource Offered']]) {
                const productOfferName = String(newRecord[tvStatFields['Free Resource Offered']]).toLowerCase();
                const id = API.productOfferMap[productOfferName];

                if (!newRecord[tvStatFields['Free Resource Offered']] === newRecord[tvStatFields['Product Offer']]) {
                    newRecord[tvStatFields['Free Resource Offered']] = id;
                } else {
                    newRecord[tvStatFields['Free Product Offer When Aired']] = true;
                }
            }
        }

        await postRequestsEvery(requestQueue, RATE_LIMIT_DELAY / RATE_LIMIT_DELAY_EVERY, responseCallback, true, beforeRequestCallback, true);
    },
}

window.addEventListener("load", async () => {
    API.getAllEmployeeIds().then(map => {
        API.employeeIdMap = map;
    });
    API.getAllTvResponseProductOffers().then(maps => {
        [ API.programNameMap, API.productOfferMap ] = maps;
    });
});

/**
 * An asynchronos function that sends POST requests from an array of request objects with 'url' and 'data' properties every specified milliseconds, and returns the 
 * successful responses in an array, additionally providing a updateUICallback function that runs every time a response is returned. Will provide a 'Retry Failed Requests'
 * button in #logButtonContainer if any requests fail.
 * 
 * @param {*} requestQueue An array of objects with 'url' and 'data' properties for sending a POST request with the data to the specified url.
 * @param {*} spacedMillis The number of milliseconds waited before sending another request.
 * @param {*} updateUICallback A function that runs every time a response is returned, passing the request index, request total count, and message parameters. 
 * @param {boolean} allMustSucceed If true, will stop sending requests when one fails, returning both failed and queued requests in an array within an error.
 * @returns 
 */
async function postRequestsEvery(requestQueue, spacedMillis, updateUICallback, allMustSucceed, beforeRequestCallback, mustWaitForPrev) {
    return await postRequests(requestQueue, spacedMillis, updateUICallback, allMustSucceed, beforeRequestCallback, mustWaitForPrev).catch((failedRequests) => {
        // appendLogMessage(`<button type='button' id='retryRequests-${retryCount}'>Retry Failed Requests</button>`);
        const retryButton = document.createElement('button');
        retryButton.type = 'button';
        retryButton.innerHTML = 'Retry Failed Requests';
        const logButtonContainer = document.getElementById('logButtonContainer');
        logButtonContainer.innerHTML = '';
        logButtonContainer.appendChild(retryButton);

        retryButton.addEventListener("click", async () => {
            retryButton.remove();
            await postRequestsEvery(failedRequests, spacedMillis, updateUICallback, allMustSucceed, beforeRequestCallback);

            // Status update
            updateUICallback?.('Done!', 'Done!');
        });
    });
}

/**
 * An asynchronos function that sends POST requests from an array of request objects with 'url' and 'data' properties every specified milliseconds, and returns the 
 * successful responses in an array, additionally providing a updateUICallback function that runs every time a response is returned. 
 * 
 * @param {*} requestQueue An array of objects with 'url' and 'data' properties for sending a POST request with the data to the specified url.
 * @param {*} spacedMillis The number of milliseconds to wait before sending a new request. If null, will send a new request once the previous response has been received.
 * @param {*} updateUICallback  A function that runs every time a response is returned, passing the request index, request total count, a message, and the response as
 * parameters. 
 * @returns 
 */
async function postRequests(requestQueue, spacedMillis, updateUICallback, allMustSucceed, beforeRequestCallback, mustWaitForPrev) {

    if (!Array.isArray(requestQueue) || !requestQueue.every(val => val.hasOwnProperty('url') && val.hasOwnProperty('data'))) {
        throw new TypeError("The requestQueue must be an array of objects with 'url' and 'data' properties for sending POST requests.");
    } else if (requestQueue.length === 0) {
        return;
    }

    return new Promise(async (resolve, reject) => {
        let i = 0, batchFailedRequests, failedRequests = [], responses = [];
        
        do {
            [requestQueue, batchFailedRequests] = await postRequestListWithDelay(requestQueue, spacedMillis, updateUICallback);
            failedRequests = failedRequests.concat(batchFailedRequests);
        } while (requestQueue.length !== 0)

        /**
         * Sends all requests every spacedMillis, and calls the updateUICallback for every request sent. 
         * Aditionally returns a list of all the requests that failed.
         * 
         * @param {*} requestList An array of objects with 'url' and 'data' objects to send as http requests.
         * @returns a list of all the requests that failed.
         */
        async function postRequestListWithDelay(requestList) {
            let resendRequests = [], failed = [];
            const REQUESTS_COUNT = requestList.length;

            for (let { url, data } of requestList) {
                const sendIndex = ++i;
                try {
                    beforeRequestCallback?.(data);
                    await new Promise((resolve, reject) => {
                        
                        updateUICallback?.(`Sending create record request (${sendIndex} of ${REQUESTS_COUNT})`);
                        let pastTimeout = false, hasResponse = false;

                        axios.post(url, data).then(response => { // Successful send to netlify

                            hasResponse = true;

                            // Error handling of knack from netlify
                            if (response?.data?.errors?.length) {
                                console.log('knack error');
                                for (let error of response.data.errors) {
                                    updateUICallback(null, `Record request (${sendIndex} of ${REQUESTS_COUNT}) error: ${error?.message}`, response);
                                }
                                
                                reject({ url, data });
                                return;
                            }

                            responses.push(response);
                            updateUICallback?.(null, `Record request (${sendIndex} of ${REQUESTS_COUNT}) successful.`, response);

                            if ((mustWaitForPrev && pastTimeout) || !spacedMillis) resolve(response);
                        }).catch(response => {

                            hasResponse = true;

                            console.log('error response', response);

                            if (response.status === 429 || response.status === 128) { // Rate limit or a strange permissions error
                                resendRequests.push({ url, data });
                            } else {
                                updateUICallback?.(null, `Could not send record request (${sendIndex} of ${REQUESTS_COUNT}): ${response.response.data}`, response);
                                failed.push({ url, data });
                                reject({ url, data });
                            }
                        });

                        setTimeout(() => {
                            pastTimeout = true;
                            if (spacedMillis && (mustWaitForPrev && hasResponse)) resolve();
                        }, spacedMillis);
                    });
                } catch (failedRequest) {
                    // Creates the failed request record twice every time

                    if (allMustSucceed) {
                        return [resendRequests, failed.concat(requestList.splice(sendIndex))];
                    }
                }
            }

            return [resendRequests, failed];
        }

        if (!failedRequests.length) {
            resolve(responses);
        } else {
            reject(failedRequests);
        }
    })
}

function createKnackToFromDateObject(fromDate, toDate, withTime = true) {
    if (!withTime) {
        return {
            "date": fromDate.toLocaleString().substring(0, fromDate.toLocaleString().indexOf(',')),
            "to": {
                "date": toDate.toLocaleString().substring(0, toDate.toLocaleString().indexOf(',')),
            },
            "all_day": true,
        }
    }

    return {
        "date": fromDate.toLocaleString().substring(0, fromDate.toLocaleString().indexOf(',')),
        "hours": Number(fromDate.getHours() % 12),
        "minutes": Number(fromDate.getMinutes()),
        "am_pm": fromDate.toLocaleString(undefined, { minutes:'2-digit' }).slice(-2).toLowerCase(),
        "to": {
            "date": toDate.toLocaleString().substring(0, toDate.toLocaleString().indexOf(',')),
            "hours": Number(toDate.getHours() % 12),
            "minutes": Number(toDate.getMinutes()),
            "am_pm": toDate.toLocaleString(undefined, { minutes:'2-digit' }).slice(-2).toLowerCase(),
        }
    }
}

export default API;