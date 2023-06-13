// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2

//localhost:8888/.netlify/functions/get-bombbomb-access-token
const handler = async (event) => {

    if (event.httpMethod !== 'POST' && event.httpMethod !== 'OPTIONS') {
        return {
            statusCode: 501,
            body: JSON.stringify({ message: "Not Implemented" }),
            headers: { 'content-type': 'application/json' }
        }
    }

    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': 'https://renner.knack.com' } };
    }

    let code, client_id;
    
    try {
        ({ code, client_id } = JSON.parse(event.body));
        console.log('client_id', client_id);
    } catch (error) {
        return { statusCode: 400, body: error.toString() }
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

      return { statusCode: 200, body: text };

    } catch (error) {
      return { statusCode: 500, body: error.toString(), headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://renner.knack.com/' } };
    }
}

module.exports = { handler }
