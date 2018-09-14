const jiraax = require('./jira-axios');

async function getBoards() {
    let jiraResults = await jiraax.axiosGetJira('rest/agile/1.0/board?');

    var list = jiraResults.data.values.map(v => { return {id: v.id, name: v.name}; });
    return list;
}

async function getSprint(sprintId) {
    let jiraResults =  await jiraax.axiosGetJira(`rest/agile/1.0/sprint/${sprintId}?'`);
    console.log(jiraResults.data);
    return jiraResults.data;
}

function getSprintUrl(boardId, startIndex){
   return `rest/agile/1.0/board/${boardId}/sprint?startAt=${startIndex}`;
}

async function getSprints(boardId) {

    let getSprintValues = [];
    let notDone = true;
    let startIndex = 0;
    let sendUrl = getSprintUrl(boardId, startIndex);

    do {
        let jiraResults =
            await jiraax.axiosGetJira(sendUrl);

            getSprintValues = [...getSprintValues, ...jiraResults.data.values];

        if(jiraResults.data.isLast == true) {
            notDone = false;
        }
        else{
            startIndex += 50;
            sendUrl = getSprintUrl(boardId, startIndex);
        }

    } while(notDone)

    return getSprintValues.filter(f => f.originBoardId == boardId).map(v => {
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
    let restCall = `rest/api/2/search?jql=${encodeURI(jql)}`;
    let jiraResults =
      await jiraax.axiosGetJira(restCall);
      console.log('search issues retrieved');
    var list =  jiraResults.data.issues;
    return list;
}

async function getSprintData(boardId, sprintId){
  let restCall = `rest/greenhopper/1.0/rapid/charts/sprintreport?rapidViewId=${boardId}&sprintId=${sprintId}`
  let jiraResults = await jiraax.axiosGetJira(restCall);
  console.log('search issues retrieved');
  var contents =  jiraResults.data.contents;
  return contents;
}


module.exports = {
    getBoards:      getBoards,
    getIssues:      getIssues,
    getSprint:      getSprint,
    getSprints:     getSprints,
    getSprintData:  getSprintData,
    searchIssues:   searchIssues
}