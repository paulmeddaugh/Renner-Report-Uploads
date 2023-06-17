// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
  
const knackHeaders = {
    /* Id received as a request parameter: increases security, adds more environment variable space in Netlify for development, is already needed by 'Report Uploads' page */
    'X-Knack-Application-Id': null,
    'X-Knack-REST-API-Key': process.env.KKEY,
    'Content-Type': 'application/json'
}

//localhost:8888/.netlify/functions/get-records
const handler = async (event) => {

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 501,
            body: JSON.stringify({ message: "Not Implemented" }),
            headers: { 'content-type': 'application/json' }
        }
    }

    try {
        const { knackAppId, type } = event.queryStringParameters;

        const url = ({
            'employees': 'https://api.knack.com/v1/objects/object_7/records',
            'tvResponses': 'https://api.knack.com/v1/objects/object_34/records'
        })[type];

        knackHeaders['X-Knack-Application-Id'] = knackAppId;

        let knackResponse;
        await fetch(url, { method: 'GET', headers: knackHeaders }).then(async response => {
            knackResponse = await response.json();
        }).catch(async response => {
            knackResponse = await response.json();
        });

        return { statusCode: 200, body: JSON.stringify(knackResponse) };
    } catch (error) {
        return { statusCode: 500, body: error.toString() };
    }

// try {
//   const subject = event.queryStringParameters.name || 'World'
//   return {
//     statusCode: 200,
//     body: JSON.stringify({ message: `Hello ${subject}` }),
//     // // more keys you can return:
//     // headers: { "headerName": "headerValue", ... },
//     // isBase64Encoded: true,
//   }
// } catch (error) {
//   return { statusCode: 500, body: error.toString() }
// }
}

module.exports = { handler }
