// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2

const knackConfig = {
  apiId: process.env.KID,
  apiKey: process.env.KKEY,
}

const basicHeaders = {
  'X-Knack-Application-Id': knackConfig.apiId,
  'X-Knack-REST-API-Key': knackConfig.apiKey,
}

const headers = {
  ...basicHeaders,
  'Content-Type': 'application/json'
}

//localhost:8888/.netlify/functions/create-record
// 'type' param with options of 'CallStatistic', 'NoteStatistic', 'TotalInteractionStatistic', and 'TVResponse'
const handler = async (event) => {

  if (event.httpMethod !== 'POST') {
    return {
        statusCode: 501,
        body: JSON.stringify({ message: "Not Implemented" }),
        headers: { 'content-type': 'application/json' }
    }
  }

  let newRecord = null, type = null, url;

  try {
    console.log('running', 0);
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

    console.log('running', 1);
  } catch (error) {
    return { statusCode: 400, body: error.toString() }
  }

  try {
    console.log('running', 2);

    let knackResponse;
    await fetch(url, { method: 'POST', headers, body: newRecord }).then(async response => {
      knackResponse = await response?.text();
      console.log('running', 3);
    });

    return { statusCode: 200, body: knackResponse };
  } catch (response) {
    console.log('running', 4, newRecord);
    console.log(response);
    console.log('running', 5);

    return { statusCode: 500, body: response.toString() }
  }
}

module.exports = { handler }
