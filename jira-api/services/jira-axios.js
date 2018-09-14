const axios = require('axios');
const config = require('config');

async function axiosGetJira(uri){
    let restCall = `https://${config.get('JIRA.access.host')}/${uri}`;
    console.log(restCall);
    let results = await axios.get(restCall, {
        auth: {
            username: config.get('JIRA.access.user'),
            password: config.get('JIRA.access.token')
        }
    });
    return results;
}

module.exports = {
    axiosGetJira:   axiosGetJira,
}