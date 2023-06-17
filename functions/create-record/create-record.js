// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2

const basicReturnHeaders = { 
  'Access-Control-Allow-Origin': 'https://renner.knack.com', 
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin', 
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const knackHeaders = {
  'X-Knack-Application-Id': process.env.KID,
  'X-Knack-REST-API-Key': process.env.KKEY,
  'Content-Type': 'application/json'
}

//localhost:8888/.netlify/functions/create-record
// 'type' param with options of 'CallStatistic', 'NoteStatistic', 'TotalInteractionStatistic', and 'TVResponse'
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
    ({ type } = event.queryStringParameters);

    url = ({
      'CallStatistic': 'https://api.knack.com/v1/objects/object_29/records',
      'NoteStatistic': 'https://api.knack.com/v1/objects/object_23/records',
      'TotalInteractionStatistic': 'https://api.knack.com/v1/objects/object_32/records',
      'TVResponse': 'https://api.knack.com/v1/objects/object_34/records',
      'CallLoopStatistic': 'https://api.knack.com/v1/objects/object_36/records',
      'BombbombStatistic': 'https://api.knack.com/v1/objects/object_37/records',
    })[type] ?? '';

  } catch (error) {
    return { statusCode: 400, body: error.toString(), headers: basicReturnHeaders };
  }

  try {

    let knackResponse;
    await fetch(url, { method: 'POST', headers: knackHeaders, body: newRecord }).then(async response => {
      knackResponse = await response?.text();
    });

    return { statusCode: 200, body: knackResponse, headers: basicReturnHeaders };
  } catch (response) {
    console.log(newRecord);
    console.log(response);

    return { statusCode: 500, body: response.toString(), headers: basicReturnHeaders }
  }
}

module.exports = { handler }
