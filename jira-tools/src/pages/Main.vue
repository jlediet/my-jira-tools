<template>
  <div class="main col-8">
    <h1>{{ msg }}</h1>
    <b-form-select v-model="selectedGroup" v-on:change="getGroupMembers" :options="groups" class="mb-3" size="sm" />
    <b-form-select v-model="selectedBoard"  v-on:change="getSprints" :options="boards" class="mb-3" size="sm" />
    <b-form-select v-model="selectedSprint" v-on:change="getIssues" :options="sprints" class="mb-3" size="sm" />
    <b-col sm="3"><label :for="`team-hours`">Full Time Hours Availble</label></b-col>
    <b-col sm="9"><b-form-input v-model="teamHours" :id="`team-hours`" type="number"></b-form-input></b-col>
    <div>
      <button v-on:click="exportSVG">Export SVG</button>
      <button v-on:click="exportPNG">Export PNG</button>
    </div>
    <div v-if="showResults">
      <h1> Results</h1>
      <div id="content-wrapper" class="content-wrapper">
        <code-loader v-if="!metrics" :speed="2" :animate="true">
        </code-loader>
        <div v-else>
          <div id="pieChart">
            <pie :id="pieChart" :data="timeByIssues" />
          </div>
          <h2>Metrics</h2>
          <b-table striped hover :items="metrics"></b-table>
          <b-table striped hover :items="timeByIssues"></b-table>
          <h2>Completed Issues</h2>
          <b-table striped hover :items="completedIssues" :fields="issueFields"></b-table>
          <h2>Incomplete Issues</h2>
          <b-table striped hover :items="incompleteIssues"  :fields="issueFields"></b-table>
        </div>
      </div>
    </div>
    <h2>Releases</h2>
  </div>
</template>

<script>
import pie from '../components/PieChart'
import { CodeLoader } from 'vue-content-loader'
import domtoimage from 'dom-to-image'

export default {
  name: 'main',
  components: {
    pie: pie,
    CodeLoader: CodeLoader
  },
  data () {
    return {
      msg: '',
      showResults: false,
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
      groupUsers: [],
      hours: [],
      timeByIssues: [],
      metrics: null,
      teamHours: 0
    }
  },
  methods: {
    getGroups: function () {
      var self = this
      console.log(this)
      this.axios.get(`${process.env.API_URL}/api/v1/getGroups`)
        .then(function (response) {
          self.groups = response.data.groups.map(g => { return { value: g.name, text: g.name } })
          self.groups.push({value: null, text: 'Select a team.'})
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
    getWorklogs: function (groupName, startDate, endDate) {
      var self = this
      let boardId = self.selectedBoard
      let sprintId = self.selectedSprint
      console.log(startDate + endDate + groupName)
      let getWorklogs = `${process.env.API_URL}/api/v1/getTimeForUsers?groupName=${encodeURI(groupName)}&startDate=${encodeURI(startDate)}&endDate=${encodeURI(endDate)}&boardId=${boardId}&sprintId=${sprintId}`
      console.log(getWorklogs)
      this.axios.get(getWorklogs)
        .then(function (response) {
          self.hours = response.data.worklogs
          self.timeByIssues = response.data.timeByIssues

          let allMetrics = []
          allMetrics.push(
            {
              Pass: 'Pass',
              Planned: response.data.plannedStoryPoints,
              Completed: response.data.completedStoryPoints,
              Incomplete: response.data.incompleteStoryPoints,
              PercentageComplete: response.data.percentageCompleted,
              AddedToSprint: response.data.countTicketsAddedToSprint,
              Velocity: response.data.velocityLast2,
              DevWorkRate: ((response.data.totalTimeForGroupHours / self.teamHours) * 100)
            })
          self.metrics = allMetrics
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    getMetrics: function (sprintId) {
      var self = this
      this.axios.get(`${process.env.API_URL}/api/v1/getSprint/${sprintId}`)
        .then(function (response) {
          let startDate = new Date(response.data.sprint.startDate).toISOString().substring(0, 10)
          let endDate = new Date(response.data.sprint.endDate).toISOString().substring(0, 10)
          let groupName = self.selectedGroup
          console.log(startDate + endDate + self.selectedGroup)
          self.getWorklogs(groupName, startDate, endDate)
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    getIssues: function (sprintId) {
      var self = this
      self.showResults = true
      this.getMetrics(sprintId)
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
      this.axios.get(`${process.env.API_URL}/api/v1/getBoards`)
        .then(function (response) {
          self.boards = response.data.boards.map(b => { return {value: b.id, text: b.name} }).sort((a, b) => {
            return a.text.localeCompare(b.text)
          })
          self.boards.push({value: null, text: 'Select a board.'})
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    exportSVG: function () {
      domtoimage.toSvg(document.getElementById('pieChart'), { quality: 1, bgcolor: '#ffffff' })
        .then(function (dataUrl) {
          var link = document.createElement('a')
          link.download = 'my-image-name.svg'
          link.href = dataUrl
          link.click()
        })
    },
    exportPNG: function () {
      domtoimage.toPng(document.getElementById('pieChart'), { quality: 1, bgcolor: '#ffffff' })
        .then(function (dataUrl) {
          var link = document.createElement('a')
          link.download = 'pieChart.png'
          link.href = dataUrl
          link.click()
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
