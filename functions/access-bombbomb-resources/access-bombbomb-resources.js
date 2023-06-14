// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2

const basicHeaders = { 
  'Access-Control-Allow-Origin': 'https://renner.knack.com', 
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin', 
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

//localhost:8888/.netlify/functions/access-bombbomb-resources
const handler = async (event) => {

    if (event.httpMethod !== 'POST' && event.httpMethod !== 'OPTIONS') {
        return {
            statusCode: 501,
            body: JSON.stringify({ message: "Not Implemented" }),
            headers: { 'content-type': 'application/json' }
        }
    }

    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: basicHeaders };
    }

    let code, client_id;
    
    try {
        ({ code, client_id } = JSON.parse(event.body));
        console.log('client_id', client_id);
    } catch (error) {
        return { statusCode: 400, body: { message: "No code or client id found." }, headers: { ...basicHeaders, 'Content-Type': 'application/json'} }
    }
    
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    const postData = {
      "grant_type": "authorization_code",
      "client_id": client_id,
      "client_secret": process.env.BSECRET,
      "code": code,
    };
    
    try {
      const response = await fetch('https://app.bombbomb.com/auth/access_token', { method: 'POST', body: JSON.stringify(postData), headers });
      const text = await response.text();

      return { statusCode: 200, body: text, headers: { ...basicHeaders, 'Content-Type': 'application/json' } };

    } catch (error) {
      return { statusCode: 500, body: error.toString(), headers: { ...basicHeaders, 'Content-Type': 'text/plain' } };
    }
}

module.exports = { handler }
