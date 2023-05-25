import axios from 'https://cdn.jsdelivr.net/npm/axios@1.4.0/+esm';
import { getNextLineIndex, updateStatusBarMessage } from './utility.js';

const knackConfig = {
    apiId: '6303cfdae045d500211ad909',
    apiKey: 'd2c92677-fc10-4443-9045-3a04854c5612',
}

const agentInQueueFields = {
    "Agent Extension": "field_318",
    "Agent": "field_319",
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

const noteStatFields = { '3CX Username': 'field_218', 'Inbound Call - Finance': 'field_219','Inbound Call - Free Offer': 'field_220','Inbound Call - Material Request': 'field_221','Inbound Call - Ministry Expansion': 'field_222','Inbound Call - Order/Donation': 'field_223','Inbound Call - Other': 'field_224','Inbound Call - Praise Report': 'field_225','Inbound Call - Prayer': 'field_226','Inbound Call - Prayer for Infilling of HS': 'field_227','Inbound Call - Prayer for Salvation': 'field_228','Inbound Email - Free Offer': 'field_229','Inbound Email - Order Fulfillment': 'field_230','Inbound Email - Other': 'field_231','Inbound Email - Prayer': 'field_232','Inbound Email - prayer@deniserenner.org': 'field_233','Outbound Call - Call from a Letter': 'field_244','Outbound Call - Death in Family': 'field_245','Outbound Call - Disaster': 'field_246','Outbound Call - Faithful': 'field_247','Outbound Call - Finance': 'field_248','Outbound Call - Follow-up': 'field_249','Outbound Call - Free Offer': 'field_250','Outbound Call - Holiday': 'field_251','Outbound Call - Lapsed': 'field_252','Outbound Call - Large Donor': 'field_253','Outbound Call - Meeting New Name': 'field_254','Outbound Call - Ministry Expansion': 'field_255','Outbound Call - New Donor': 'field_256','Outbound Call - NNPPC': 'field_257','Outbound Call - Orders/Donations': 'field_258','Outbound Call - Other': 'field_259','Outbound Call - Prayer': 'field_260','Outbound Call - Reconnect': 'field_261','Outbound Call - Relief': 'field_262','Outbound Email - CFL': 'field_263','Outbound Email - Disaster': 'field_264','Outbound Email - Faithful': 'field_265','Outbound Email - Finance': 'field_266','Outbound Email - Follow-up': 'field_267','Outbound Email - Holiday': 'field_268','Outbound Email - Lapsed': 'field_269','Outbound Email - Large Donor': 'field_270','Outbound Email - Ministry Expansion': 'field_271','Outbound Email - NNC': 'field_272','Outbound Email - NNPPC': 'field_273','Outbound Email - Order Fulfillment': 'field_274','Outbound Email - Other': 'field_275','Outbound Email - Prayer@renner': 'field_276','Outbound Email - Reconnect': 'field_277','Outbound Email - Relief': 'field_278','Outbound Email - Response': 'field_279','Outbound Mail - Card': 'field_280','Outbound Mail - Follow-up': 'field_281','Outbound Mail - Mini Book': 'field_282','Outbound Mail - Ministry Expansion': 'field_283','Outbound Mail - Other': 'field_284','Outbound Mail - PC Prayer Only': 'field_285','Outbound Mail - PC w/ Gift': 'field_286','Outbound Mail - Postcard': 'field_287' };

const basicHeaders = {
    'X-Knack-Application-Id': knackConfig.apiId,
    'X-Knack-REST-API-Key': knackConfig.apiKey,
}

const RATE_LIMIT_DELAY_EVERY = 6; 
const RATE_LIMIT_DELAY = 3150;
const REQUEST_BATCH_INITIAL_WAIT = 100;

let recordCount = 0;

const API = {

    employeeIdMap: {},

    getAllEmployees() { 
        return new Promise((resolve, reject) => {
            const config = {
                headers: {
                    ...basicHeaders,
                }
            }
            axios.get('https://api.knack.com/v1/objects/object_7/records', config).then((response) => {
                resolve(response.data.records);
            }).catch((response) => {
                reject(`${response.data.message}\n${response.data.status}`);
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

    async uploadAgentInQueueReport(csvText, updateUICallback) {
        return this.uploadReport(csvText, 'Agent In Queue', updateUICallback);
    },

    async uploadNoteStatisticReport(csvText, updateUICallback) {
        return this.uploadReport(csvText, 'Note Statistic', updateUICallback);
    },

    /**
     * Assumes there are headers
     * 
     * @param {*} csvText 
     */
    async uploadReport(csvText, type, updateUICallback) {
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
                    nextLineData[columnIndex] = this.employeeIdMap[String(nextLineData[columnIndex]).toLowerCase()]
                }

                newRecordObject[field] = nextLineData[columnIndex];
            }

            const netlifyType = ({
                'Agent In Queue': 'CallStatistic',
                'Note Statistic': 'NoteStatistic',
            })[type];

            requestQueue.push({
                url: `/.netlify/functions/create-stat-record?type=${netlifyType}`,
                data: JSON.stringify(newRecordObject)
            });
        }

        await postRequestEvery(requestQueue, RATE_LIMIT_DELAY / RATE_LIMIT_DELAY_EVERY, updateUICallback);
    }
}

window.addEventListener("load", async () => {
    API.employeeIdMap = await API.getAllEmployeeIds();
});

function createKnackToFromDateObject(fromDate, toDate) {
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

const requestQueue = [];
let lastSentTime = 0, lastSendId = 0, totalSent = 0;

async function postRequestEvery(requestQueue, spacedMillis, updateUICallback) {
    return new Promise(async (resolve, reject) => {
        let i = 0;
        for (let { url, data } of requestQueue) {
            updateUICallback(i++, requestQueue.length);
            axios.post(url, data).then(response => {
                console.log(response);
            }).catch(response => {

            });

            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, spacedMillis);
            });
        }

        resolve();
    })
}

async function createRecordWithRateLimit(url, data, config) {

    requestQueue.push({ url, data, config });
    this.sendId = totalSent++;
    const timeSinceLastRequest = -(lastSentTime - Date.now());
    // console.log(timeSinceLastRequest);

    await new Promise(resolve => {
        if (timeSinceLastRequest > RATE_LIMIT_DELAY + 150) {
            setTimeout(() => {
                resolve();
                console.log('initial waited');
                send();
            }, REQUEST_BATCH_INITIAL_WAIT);
        } else {
            resolve();
        }
    });

    function send() {
        console.log(requestQueue.length)
        if (this.sendId % RATE_LIMIT_DELAY_EVERY === 0 || 
            (requestQueue.length / RATE_LIMIT_DELAY_EVERY < 0 && id === requestQueue.length)) {
                console.log(2);
            
            console.log((timeSinceLastRequest < RATE_LIMIT_DELAY ? timeSinceLastRequest : 0) + Math.floor(requestQueue.length / RATE_LIMIT_DELAY_EVERY) * RATE_LIMIT_DELAY);
            setTimeout(() => {
                
                sendRequestQueue(requestQueue);
                lastSentTime = Date.now();
                console.log('sending batch');
            }, (timeSinceLastRequest < RATE_LIMIT_DELAY ? timeSinceLastRequest : 0) + Math.floor(requestQueue.length / RATE_LIMIT_DELAY_EVERY) * RATE_LIMIT_DELAY);
            
        }
    }
    
    // return new Promise((resolve, reject) => {
    //     axios.post(url, data, config).then((response) => {
    //         console.log(response.data);
    //         resolve(response.data);
    //     }).catch(async (response) => {
    //         if (response.status === 429) {
    //             return createRecordWithRateLimit(url, data, config);
    //         } else {
    //             reject(response);
    //         }
    //     });
    // });
}

/**
 * Sends requests in batches of RATE_LIMIT_DELAY_EVERY or less.
 */
function sendRequestQueue(requestQueue) {
    for (let i = 0; i < Math.min(requestQueue.length, RATE_LIMIT_DELAY_EVERY); i++) {
        const { url, data, config } = requestQueue.shift();

        console.log('request');
        // axios.post(url, data, config).then((response) => {
        //     console.log(response.data);
        // }).catch((response) => {
        //     console.log(response.data);
        // });
    }
}

export default API;