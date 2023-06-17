// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2

const basicReturnHeaders = { 
  'Access-Control-Allow-Origin': 'https://renner.knack.com', 
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin', 
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const knackHeaders = {
  /* Id received as a request parameter: increases security, adds more environment variable space in Netlify for development, is already needed by 'Report Uploads' page */
  'X-Knack-Application-Id': null,
  'X-Knack-REST-API-Key': process.env.KKEY,
  'Content-Type': 'application/json'
}

//localhost:8888/.netlify/functions/create-record
// 'type' param with options of 'CallStatistic', 'NoteStatistic', 'TotalInteractionStatistic', 'TVResponse', 'CallLoopStatistic', and 'BombbombStatistic'
const handler = async (event) => {

  if (event.httpMethod !== 'POST' && event.httpMethod !== 'OPTIONS') {
    return {
        statusCode: 501,
        body: JSON.stringify({ message: "Not Implemented" }),
        headers: { 'content-type': 'application/json' }
    }
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: basicReturnHeaders };
  }

  let newRecord = null, type = null, url;

  try {
    ({ body: newRecord } = event);
    ({ knackAppId, type } = event.queryStringParameters);

    url = ({
      'CallStatistic': 'https://api.knack.com/v1/objects/object_29/records',
      'NoteStatistic': 'https://api.knack.com/v1/objects/object_23/records',
      'TotalInteractionStatistic': 'https://api.knack.com/v1/objects/object_32/records',
      'TVResponse': 'https://api.knack.com/v1/objects/object_34/records',
      'CallLoopStatistic': 'https://api.knack.com/v1/objects/object_36/records',
      'BombbombStatistic': 'https://api.knack.com/v1/objects/object_37/records',
    })[type];

    knackHeaders['X-Knack-Application-Id'] = knackAppId;

    if (!url) {
      throw new Error(`No type '${type}' found.`);
    } else if (!knackAppId) {
      throw new Error(`No knack app id provided: ${knackAppId}`);
    }
  } catch (error) {
    return { statusCode: 400, body: error.toString(), headers: { ...basicReturnHeaders, 'Content-Type': 'text/plain' } };
  }

  try {
    let knackResponse;
    await fetch(url, { method: 'POST', headers: knackHeaders, body: newRecord }).then(async response => {
      knackResponse = await response?.text();
      try {
        JSON.parse(knackResponse).id;
      } catch (error) {
        throw new Error(knackResponse);
      }
    });

    return { statusCode: 200, body: knackResponse, headers: basicReturnHeaders };
  } catch (response) {
    console.log(newRecord);
    console.log(response);

    return { statusCode: 500, body: response.toString(), headers: basicReturnHeaders }
  }
}

module.exports = { handler }
