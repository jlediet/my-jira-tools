const jiraax = require('./jira-axios');

async function getBoards() {
    let jiraResults = await jiraax.axiosGetJira('rest/agile/1.0/board?');

    var list = jiraResults.data.values.map(v => { return {id: v.id, name: v.name}; });
    return list;
}

async function getSprints(boardId) {
    let jiraResults =
      await jiraax.axiosGetJira(`rest/agile/1.0/board/${boardId}/sprint?`);

    return jiraResults.data.values.filter(f => f.originBoardId == boardId).map(v => {
        return {id: v.id, name: v.name};
    });
}

async function getIssues(sprintId) {
    console.log('get issues');
    let jiraResults =
      await jiraax.axiosGetJira(`rest/agile/1.0/sprint/${sprintId}/issue?`);
      console.log('issues retrieved');
    var list =  jiraResults.data.issues;
    return list;
}

async function searchIssues(jql){

}


module.exports = {
    getBoards:  getBoards,
    getIssues:  getIssues,
    getSprints: getSprints,
    searchIssues:   searchIssues
}