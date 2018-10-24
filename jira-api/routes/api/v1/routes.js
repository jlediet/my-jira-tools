const asyncMiddleware = require('../../../middleware/async');
const agileservices = require('../../../services/jira-agile');
const jiraservices = require('../../../services/jira-rest');
const agilehelpers = require('../../../helpers/jira-agile');
var moment = require('moment');

var appRouter = function (app) {

// get all todos
app.get('/api/v1/getBoards', asyncMiddleware(async function(req, res, next){
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
    } = req.query;

    let groupMembers = [];
    //GET MEMBERS

    let members = await jiraservices.getUsersForGroup(groupName);

    members.forEach(member =>
        groupMembers.push({ key: member.key, worklogs: [], totalTimeInSeconds: 0 }));

    //GET ISSUES
    let jql = `worklogAuthor in membersOf("${groupName}") and worklogDate >= "${startDate}" and worklogDate <= "${endDate}"`;
    let issues = await agileservices.searchIssues(jql);
    let totalTimeForGroupSeconds = 0;
    let issuesTypeCounts = [];

    //Build list of issues by unqiue IssueType
    let unique = [...new Set(issues.map(issue => issue.fields.issuetype.name))];
    unique.forEach(v =>  issuesTypeCounts.push({type: v, timeSpentSeconds:0, timeSpentHours: 0}));
    var mStartDate = moment(startDate);
    var mEndDate = moment(endDate);

    issues.forEach(async (curIssue) => {
        let curFields = curIssue.fields;
        let issueType = curFields.issuetype.name;

        if(issueType === 'Sub-task'){
          issueType = curFields.parent.fields.issuetype.name;
        }

        var issueObj = issuesTypeCounts.find(function(iobj){ return iobj.type === issueType;})

        let newWorklogs = await jiraservices.getWorklog(curIssue.key)
        console.log(curIssue.key);
        for(var wlog in newWorklogs){
          var curLog = newWorklogs[wlog];
          var mUpdatedDate = moment(moment(curLog.started).format("YYYY-MM-DD"));
          //if (curIssue.key == "MYP-2162") console.log(curLog + '' + mUpdatedDate.isSameOrAfter(mStartDate) + ' ' + mUpdatedDate.isSameOrBefore(mEndDate));
          if(mUpdatedDate.isSameOrAfter(mStartDate) && mUpdatedDate.isSameOrBefore(mEndDate)){
            console.log(curLog)
            var obj = groupMembers.find(function (obj) { return obj.key === curLog.author; });

            if (typeof obj != "undefined") {
              issueObj.timeSpentSeconds += curLog.timeSpentSeconds;
              issueObj.timeSpentHours += curLog.timeSpentSeconds/3600;
              console.log(curLog.timeSpentSeconds/3600);
            }
          }
        }

    });

    let sprintData = await agileservices.getSprintData(boardId, sprintId);
    let percentageComplete = ((sprintData.completedIssuesEstimateSum.value/sprintData.completedIssuesInitialEstimateSum.value)) * 100
    let storiesAdded = Object.keys(sprintData.issueKeysAddedDuringSprint).length
    let payload = {
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
      incompleteStoryPoints: sprintData.issuesNotCompletedEstimateSum.value || 0,
      percentageCompleted: percentageComplete,
      countTicketsAddedToSprint: storiesAdded,
      velocityLast2: -1
  };
  res.status(200).send(payload)
}));

}

module.exports = appRouter;