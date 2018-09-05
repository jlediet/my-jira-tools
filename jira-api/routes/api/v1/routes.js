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

app.get('/api/v1/getTimeForUsers/', asyncMiddleware(async function(req, res, next){

    let group = req.query.groupName;
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;
    let groupMembers = [];
    //GET MEMBERS
    let members = await jiraservices.getUsersForGroup(req.params.groupName);
    members.foreach(member => {
        groupMembers.push({})
    })
    //GET ISSUES
    //let jql = worklogAuthor in membersOf("Team Blue") and worklogDate >= "2018-08-14" and worklogDate <= "2018-08-31"
    let jql = null;
    let issues = await agileservices.searchIssues(jql);

    issues.foreach( function( currentObj){

    })

    //FOR EACH ISSUE
    //FOR EACH WORKLOG
    //ADD WORKLOG TIME TO USER WORKLOG TIME
    //ADD WORKLOG TIME TO TOTAL TIME
    //ADD WORKLOG TIME TO ISSUE TYPE

}));

}

module.exports = appRouter;