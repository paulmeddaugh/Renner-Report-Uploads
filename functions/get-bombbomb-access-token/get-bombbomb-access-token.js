// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2

const handler = async (event) => {

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 501,
            body: JSON.stringify({ message: "Not Implemented" }),
            headers: { 'content-type': 'application/json' }
        }
    }

    let code;

    try {
        ({ code } = event.body);
    
        console.log('running', code);
    } catch (error) {
        return { statusCode: 400, body: error.toString() }
    }
    
    const headers = { 'Content-Type': 'application/json' };
    const postData = {
      "grant_type": "authorization_code",
      "client_id": process.env.BID,
      "client_secret": process.env.BSECRET,
      "code": code,
    };
    
    try {
      const response = await fetch('https://app.bombbomb.com/auth/access_token', { method: 'POST', body: JSON.stringify(postData), headers, redirect: 'follow' });
      const text = await response.text();

      return { statusCode: 200, body: text };
    } catch (error) {
      console.log(error.status, error.error);
      return { statusCode: 500, body: error.toString() };
    }
}

module.exports = { handler }
