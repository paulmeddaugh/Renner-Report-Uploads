// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
  
const knackHeaders = {
    /* Id received as a request parameter: increases security, adds more environment variable space in Netlify for development, is already needed by 'Report Uploads' page */
    'X-Knack-Application-Id': null,
    'X-Knack-REST-API-Key': process.env.KKEY,
    'Content-Type': 'application/json'
}

const contentType = {
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

    // Correct parameter testing
    let url;
    try {
        const { knackAppId, type } = event.queryStringParameters;
    
        url = ({
            'employees': 'https://api.knack.com/v1/objects/object_7/records',
            'tvResponses': 'https://api.knack.com/v1/objects/object_34/records'
        })[type];
    
        knackHeaders['X-Knack-Application-Id'] = knackAppId;
        
        if (!url) {
            throw new Error(`No type '${type}' found.`);
          } else if (!knackAppId) {
            throw new Error(`No knack app id provided: ${knackAppId}`);
          }
    } catch (error) {
        return { statusCode: 400, body: JSON.stringify({ message: error.toString() }), headers: contentType };
      }

    // Actual knack request
    try {
        console.log('knack key', knackHeaders['X-Knack-REST-API-Key']);

        let knackResponse;
        await fetch(url, { method: 'GET', headers: knackHeaders }).then(async response => {
            knackResponse = await response?.text();
            try {
                JSON.parse(knackResponse).id;
            } catch (error) {
                throw new Error(knackResponse);
            }
        });

        return { statusCode: 200, body: knackResponse, headers: contentType };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: error.toString() }), headers: contentType };
    }
}

module.exports = { handler }
