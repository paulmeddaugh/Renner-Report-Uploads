// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2

const knackConfig = {
  apiId: process.env.API_ID,
  apiKey: process.env.API_KEY,
}

const basicHeaders = {
  'X-Knack-Application-Id': knackConfig.apiId,
  'X-Knack-REST-API-Key': knackConfig.apiKey,
}

//localhost:8888/.netlify/functions/create-record.js
const handler = async (event) => {

  if (event.httpMethod !== 'POST') {
    return {
        statusCode: 501,
        body: JSON.stringify({ message: "Not Implemented" }),
        headers: { 'content-type': 'application/json' }
    }
  }

  const { body: newRecord } = event;
  const { type } = event.queryStringParameters;

  const headers = {
    ...basicHeaders,
    'Content-Type': 'application/json'
  }

  const url = ({
    'CallStatistic': 'https://api.knack.com/v1/objects/object_29/records',
    'NoteStatistic': 'https://api.knack.com/v1/objects/object_23/records',
  })[type];

  let knackResponse;
  await fetch(url, { method: 'POST', headers, body: newRecord }).then(async response => {
    knackResponse = await response.json();
  }).catch(async response => {
    knackResponse = await response.json();
  });

  return { statusCode: 200, body: JSON.stringify(knackResponse) };

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
