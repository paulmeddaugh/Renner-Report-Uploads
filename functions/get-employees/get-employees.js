// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
  
const basicHeaders = {
    'X-Knack-Application-Id': process.env.API_ID,
    'X-Knack-REST-API-Key': process.env.API_KEY,
}

//localhost:8888/.netlify/functions/get-call-stat-queues
const handler = async (event) => {

if (event.httpMethod !== 'GET') {
    return {
        statusCode: 501,
        body: JSON.stringify({ message: "Not Implemented" }),
        headers: { 'content-type': 'application/json' }
    }
}

const headers = {
    ...basicHeaders,
    'Content-Type': 'application/json'
}

let knackResponse;
await fetch('https://api.knack.com/v1/objects/object_7/records', { method: 'GET', headers }).then(async response => {
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
