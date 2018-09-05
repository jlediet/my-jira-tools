const axios = require('axios');
const config = require('config');

async function axiosGetJira(uri){
    let results = await axios.get(`https://${config.get('JIRA.access.host')}/${uri}`, {
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