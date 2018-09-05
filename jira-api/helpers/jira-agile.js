const agileservices = require('../services/jira-agile');

async function getCompletedIssues(sprintId){
    let issues = await  agileservices.getIssues(sprintId);
    let filtered = issues.map(i => i).filter(f => {
            return f.fields.status.name === "Fixed" && f.fields.issuetype.name != "Sub-task"}).map(m => {
                        var newObj = new Object;
                        newObj.id = m.id;
                        newObj.key = m.key;
                        newObj.summary = m.fields.summary;
                        newObj.type = m.fields.issuetype.name;
                        return newObj;
                    })
    return filtered;

}

async function getInCompleteIssues(sprintId){
    let issues = await agileservices.getIssues(sprintId);
    let filtered = issues.map(i => i).filter(f => {
        return f.fields.status.name !== "Fixed" && f.fields.issuetype.name != "Sub-task"}).map(m => {
                    var newObj = new Object;
                    newObj.id = m.id;
                    newObj.key = m.key;
                    newObj.summary = m.fields.summary;
                    newObj.type = m.fields.issuetype.name;
                    return newObj;
                })
    return filtered;
}

module.exports = {
    getInCompleteIssues:    getInCompleteIssues,
    getCompletedIssues:     getCompletedIssues
}