const jiraax = require('./jira-axios');

async function getGroups() {
    let results = await jiraax.axiosGetJira('rest/api/2/groups/picker?query=Team');
    return results.data.groups.map(v => {
      return { name: v.name, description: v.name };
    });
}

async function getUsersForGroup(groupName) {
    let results = await jiraax.axiosGetJira(`rest/api/2/group/member?groupname=${encodeURI(groupName)}`);

    return results.data.values.map(v => {
      return { key: v.key, name: v.name };
    });
}

async function getWorklog(issueKey){

    return worklogsForIssue;
}

module.exports = {
    getGroups:  getGroups,
    getUsersForGroup:  getUsersForGroup
}