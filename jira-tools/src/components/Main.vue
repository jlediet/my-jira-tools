<template>
  <div class="main col-8">
    <h1>{{ msg }}</h1>
    <h2>Sprint Report</h2>
    <h3>Select Team</h3>
    <b-form-select v-model="selectedGroup" v-on:change="getGroupMembers" :options="groups" class="mb-3" size="sm" />
    <b-table striped hover :items="groupUsers"></b-table>
    <b-form-select v-model="selectedBoard"  v-on:change="getSprints" :options="boards" class="mb-3" size="sm" />
    <b-form-select v-model="selectedSprint" v-on:change="getIssues" :options="sprints" class="mb-3" size="sm" />
    <h1> Results</h1>
    <h2>Completed Issues</h2>
    <b-table striped hover :items="completedIssues" :fields="issueFields"></b-table>
    <h2>Incomplete Issues</h2>
    <b-table striped hover :items="incompleteIssues"  :fields="issueFields"></b-table>
    <h2>Releases</h2>
  </div>
</template>

<script>
export default {
  name: 'main',
  data () {
    return {
      msg: '',
      selectedBoard: null,
      selectedSprint: null,
      selectedGroup: null,
      boards: [
        {value: null, text: 'Please Select a Board'}
      ],
      sprints: [
        {value: null, text: 'Please Select a Sprint'}
      ],
      issueFields: [
        'type', 'key', 'summary'
      ],
      completedIssues: [],
      incompleteIssues: [],
      groups: [],
      groupUsers: []
    }
  },
  methods: {
    getGroups: function () {
      var self = this
      console.log(this)
      this.axios.get(`${process.env.API_URL}/api/v1/getGroups`)
        .then(function (response) {
          self.groups = response.data.groups.map(g => { return { value: g.name, text: g.name } })
          console.log(self.groups)
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    getGroupMembers: function (groupName) {
      var self = this
      console.log(this)
      console.log(groupName)
      this.axios.get(`${process.env.API_URL}/api/v1/getUsersForGroups/${encodeURI(groupName)}`)
        .then(function (response) {
          self.groupUsers = response.data.groups
          console.log(response.data)
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    getIssues: function (sprintId) {
      this.getIssuesCompleted(sprintId)
      this.getIssuesNotCompleted(sprintId)
    },
    getIssuesCompleted: function (sprintId) {
      var self = this
      console.log(sprintId)
      console.log(this)
      this.axios.get(`${process.env.API_URL}/api/v1/getCompletedIssues/${sprintId}`)
        .then(function (response) {
          self.completedIssues = response.data.issues.sort((a, b) => {
            return a.type.localeCompare(b.type)
          })
          console.log(response.data)
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    getIssuesNotCompleted: function (sprintId) {
      var self = this
      console.log(sprintId)
      console.log(this)
      this.axios.get(`${process.env.API_URL}/api/v1/getIncompleteIssues/${sprintId}`)
        .then(function (response) {
          self.incompleteIssues = response.data.issues.sort((a, b) => {
            return a.type.localeCompare(b.type)
          })
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    getSprints: function (boardId) {
      var self = this
      this.axios.get(`${process.env.API_URL}/api/v1/getSprints/${boardId}`)
        .then(function (response) {
          self.sprints = response.data.sprints.map(b => { return {value: b.id, text: b.name} })
          self.sprints.push({value: null, text: 'Select a sprint.'})
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    getBoards: function () {
      var self = this
      this.axios.get('${process.env.API_URL}/api/v1/getBoards')
        .then(function (response) {
          self.boards = response.data.boards.map(b => { return {value: b.id, text: b.name} }).sort((a, b) => {
            return a.text.localeCompare(b.text)
          })
          self.boards.push({value: null, text: 'Select a board.'})
        })
        .catch(function (error) {
          console.log(error)
        })
    }
  },
  mounted: function () {
    this.getGroups()
    this.getBoards()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #35495E;
}
</style>
