<!--

Based on:
  https://bl.ocks.org/shimizu/f90651541575f348a129444003a73467

Links:
  Props: https://vuejs.org/v2/guide/components.html#Passing-Data-with-Props
  Methods: https://vuejs.org/v2/guide/events.html#Method-Event-Handlers

-->

<template>
  <svg width='1000' height='600'></svg>
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

    this.legend = this.chartLayer
      .append('g')
      .attr(
        'transform',
        `translate(${chartWidth - 200},0)`
      )

    this.legendX = (chartWidth / 2) - 200
    this.legendY = (chartHeight / 2) * -1
    this.legendW = 200
    this.legendL = 125

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

      this.legend.selectAll('.legend').remove()
      var legendBlock = this.legend.selectAll('.legend')
        .data(arcs)

      block.select('path').attr('d', this.arc)
      legendBlock.select('path').attr('d', this.arc)

      var newBlock = block
        .enter()
        .append('g')
        .classed('arc', true)

      var newLegendBlock = legendBlock
        .enter()
        .append('g')
        .classed('legend', true)

      var colorScale = d3.scaleOrdinal(d3['schemePaired'])

      newBlock.append('path')
        .attr('d', this.arc)
        .attr('id', function (d, i) { return 'arc-' + i })
        .attr('stroke', 'gray')
        .attr('fill', (d, i) => colorScale(i * 3))

      newLegendBlock.append('text')
        .attr('d', this.arc)
        .attr('id', function (d, i) { return 'legend-txt-' + i })
        .attr('x', 1)
        .attr('y', function (d, i) {
          return ((20 * (i + 1)))
        })
        .attr('width', 180)
        .text(function (d) {
          var v = Math.round(d.data.timeSpentSeconds / 3600)
          return d.data.type + ' (' + v.toString() + 'h )'
        })

      newLegendBlock.append('rect')
        .attr('d', this.arc)
        .attr('id', function (d, i) { return 'legend-rect-' + i })
        .attr('x', 180)
        .attr('y', function (d, i) {
          return ((20 * i))
        })
        .attr('width', 20)
        .attr('height', 20)
        .style('fill', (d, i) => colorScale(i * 3))
        .style('stroke', '#000000')
    }
  }
}
</script>
