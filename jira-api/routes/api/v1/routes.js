const asyncMiddleware = require('../../../middleware/async');
const agileservices = require('../../../services/jira-agile');
const jiraservices = require('../../../services/jira-rest');
const agilehelpers = require('../../../helpers/jira-agile');

var appRouter = function (app) {

// get all todos
app.get('/api/v1/getBoards', asyncMiddleware(async function(req, res, next){
    console.log('GetBoards');
    let data = await agileservices.getBoards();
    res.status(200).send({
      success: 'true',
      message: 'Boards Retreived',
      boards: data
    })
  }));

  app.get('/api/v1/getSprint/:sprintId', asyncMiddleware(async function(req, res, next){

    let data = await agileservices.getSprint(req.params.sprintId);
    res.status(200).send({
      success: 'true',
      message: 'Sprints Retreived',
      sprint: data
    })
  }));
  // get all todos
app.get('/api/v1/getSprints/:boardId', asyncMiddleware(async function(req, res, next){

    let data = await agileservices.getSprints(req.params.boardId);
    res.status(200).send({
      success: 'true',
      message: 'Sprints Retreived',
      sprints: data
    })
  }));

app.get('/api/v1/getCompletedIssues/:sprintId', asyncMiddleware(async function(req, res, next){

let data = await agilehelpers.getCompletedIssues(req.params.sprintId);
res.status(200).send({
    success: 'true',
    message: 'Completed Issues Retreived',
    issues: data
})
}));

app.get('/api/v1/getIncompleteIssues/:sprintId', asyncMiddleware(async function(req, res, next){

let data = await agilehelpers.getInCompleteIssues(req.params.sprintId);
console.log(data);
res.status(200).send({
    success: 'true',
    message: 'Incomplete Issues Retreived',
    issues: data
})
}));

app.get('/api/v1/getGroups/', asyncMiddleware(async function(req, res, next){

    let data = await jiraservices.getGroups();
    console.log(data);
    res.status(200).send({
        success: 'true',
        message: 'Groups Retreived',
        groups: data
    })
}));

app.get('/api/v1/getUsersForGroups/:groupName', asyncMiddleware(async function(req, res, next){

    let data = await jiraservices.getUsersForGroup(req.params.groupName);
    console.log(data);
    res.status(200).send({
        success: 'true',
        message: 'Users for Groups Retreived',
        groups: data
    })
}));

app.get('/api/v1/getTimeForUsers/', asyncMiddleware(async (req, res, next) => {
    let {
        groupName, startDate, endDate, boardId, sprintId
    } = req.query
    // let group = req.query.groupName;
    // let startDate = req.query.startDate;
    // let endDate = req.query.endDate;
    // let boardId = req.query.boardId;
    // let sprintId = req.query.sprintId;

    let groupMembers = [];
    //GET MEMBERS
    let members = await jiraservices.getUsersForGroup(group);

    for(var member in members)
    {
        groupMembers.push({ key: members[member].key, worklogs: [], totalTimeInSeconds: 0 })
    }

    //GET ISSUES
    let jql = `worklogAuthor in membersOf("${group}") and worklogDate >= "${startDate}" and worklogDate <= "${endDate}"`;
    let issues = await agileservices.searchIssues(jql);
    let worklogs = [];
    let totalTimeForGroupSeconds = 0;
    let issuesTypeCounts = [];
    for(var issue in issues)
    {
        let newWorklogs = await jiraservices.getWorklog(issues[issue].key)
        let curIssue = issues[issue];
        let curFields = curIssue.fields;
        let issueType = curFields.issuetype.name;

        if(issueType === 'Sub-task'){
          issueType = curFields.parent.fields.issuetype.name;
        }
        var issueObj = issuesTypeCounts.find(function(iobj){ return iobj.type === issueType;})

        if(issueType != "Epic"){
          if(typeof issueObj == "undefined"){
            issuesTypeCounts.push({type: issueType, timeSpentSeconds:curFields.aggregatetimespent})
          }
          else{
            issueObj.timeSpentSeconds += curFields.aggregatetimespent
          }
        }

        for(var wlog in newWorklogs){

            var obj = groupMembers.find(function (obj) { return obj.key === newWorklogs[wlog].author; });
            if (typeof obj != "undefined") {
                // obj.worklogs.push({ issueId: newWorklogs[wlog].issueId, timeSpendSeconds: newWorklogs[wlog].timeSpentSeconds });
                obj.totalTimeInSeconds += newWorklogs[wlog].timeSpentSeconds;
                totalTimeForGroupSeconds += newWorklogs[wlog].timeSpentSeconds;
            }
        }
    }

    let sprintData = await agileservices.getSprintData(boardId, sprintId);
    let percentageComplete = ((sprintData.completedIssuesEstimateSum.value/sprintData.completedIssuesInitialEstimateSum.value)) * 100
    let storiesAdded = Object.keys(sprintData.issueKeysAddedDuringSprint).length
    console.log(storiesAdded)
    res.status(200).send({
        success: 'true',
        message: 'Users for Groups Retreived',
        totalTimeForGroupSeconds: totalTimeForGroupSeconds,
        totalTimeFrGroupMinutes: totalTimeForGroupSeconds/ 60,
        totalTimeForGroupHours: (totalTimeForGroupSeconds/60)/60,
        totalTimeForGroupDays: ((totalTimeForGroupSeconds/60)/60)/6,
        timeByIssues: issuesTypeCounts,
        worklogs: groupMembers,
        plannedStoryPoints: sprintData.completedIssuesInitialEstimateSum.value,
        completedStoryPoints: sprintData.completedIssuesEstimateSum.value,
        incompleteStoryPoints: sprintData.issuesNotCompletedEstimateSum.value,
        percentageCompleted: percentageComplete,
        countTicketsAddedToSprint: storiesAdded
    })
}));

}

module.exports = appRouter;