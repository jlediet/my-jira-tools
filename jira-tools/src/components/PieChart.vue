<!--

Based on:
  https://bl.ocks.org/shimizu/f90651541575f348a129444003a73467

Links:
  Props: https://vuejs.org/v2/guide/components.html#Passing-Data-with-Props
  Methods: https://vuejs.org/v2/guide/events.html#Method-Event-Handlers

-->

<template>
  <svg width='500' height='300'></svg>
</template>

<script>

const d3 = require('d3')

export default {
  mounted: function () {
    var svg = d3.select(this.$el)
    var width = +svg.attr('width')
    var height = +svg.attr('height')

    var margin = { top: 20, left: 0, bottom: 30, right: 0 }

    var chartWidth = width - (margin.left + margin.right)
    var chartHeight = height - (margin.top + margin.bottom)

    this.chartLayer = svg
      .append('g')
      .attr(
        'transform',
        `translate(${margin.left}, ${margin.top})`
      )

    this.arc = d3.arc()
      .outerRadius(chartHeight / 2)
      .innerRadius(0)
      // .padAngle(0.03)
      // .cornerRadius(8)

    this.pieG = this.chartLayer
      .append('g')
      .attr(
        'transform',
        `translate(${chartWidth / 2}, ${chartHeight / 2})`
      )

    this.drawChart(this.data)
  },
  props: ['data'],
  watch: {
    data: function (newData) {
      this.drawChart(newData)
    }
  },
  methods: {
    drawChart: function (data) {
      var arcs = d3.pie()
        .sort(null)
        .value(function (d) { return d.timeSpentSeconds })(data)

      var block = this.pieG.selectAll('.arc')
        .data(arcs)

      block.select('path').attr('d', this.arc)

      var newBlock = block
        .enter()
        .append('g')
        .classed('arc', true)

      newBlock.append('path')
        .attr('d', this.arc)
        .attr('id', function (d, i) { return 'arc-' + i })
        .attr('stroke', 'gray')
        .attr('fill', d => d3.interpolateSpectral(Math.random()))

      console.log(this.arc)

      newBlock.append('text')
        .attr('dx', 10)
        .attr('dy', -5)
        // .append('textPath')
        .attr('xlink:href', function (d, i) { return '#arc-' + i })
        .text(function (d) { return d.data.type })
    }
  }
}
</script>