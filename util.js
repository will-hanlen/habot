const { APIcall } = require('./api')

function stringifyGoal(data) {

    const user = data.user
    const count = data.count ? `${data.count} ` : ''
    const name = data.name ? `${data.name} ` : ''
    const delim1 = data.delim1 ? `${data.delim1} ` : ''
    const frequency = data.frequency ? `${data.frequency} ` : ''
    const interval = data.interval ? `${data.interval} ` : ''
    const delim2 = data.delim2 ? `${data.delim2} ` : ''
    const end = prettyDate(data.end)
    const start = ` starting ${prettyDate(data.start)}`

    const goal = count + name + delim1 + frequency + interval + delim2 + end + start

    const progress = progressMeter(data)

    return goal + "\n" + progress

}

function prettyDate(date) {
    const d = new Date(date)
    const year = d.getUTCFullYear()
    const month = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function dii(interval) {
    if (interval == "day") return 1
    if (interval == "week") return 7
    if (interval == "month") return 30
}

function progressMeter(goal) {
    const recurring = goal.delim1 // whether goal has an interval clause

    if (recurring) {

        // console.log(`\n\n${goal.name}`)

        const daysInPeriod = dii(goal.interval) * (goal.frequency || 1)

        const msInPeriod = daysInPeriod * 86400000

        const maxPossiblePeriods = Math.floor(
            Math.abs(new Date(goal.start) - new Date(goal.end)) / msInPeriod)

        const MsSinceGoalStart = Math.abs(new Date(goal.start) - Date.now())

        const DaysSinceGoalStart = Math.floor(MsSinceGoalStart / 86400000)

        const periodsSinceStart = Math.floor(DaysSinceGoalStart / daysInPeriod)

        let periods = []

        let pStart = new Date(goal.start)
        let pEnd = new Date(pStart.getTime() + msInPeriod)

        while (pStart < Date.now()) {


            const periodLogs = goal.logs.filter(l => {
                const d = new Date(l.date)
                const afterPstart = d >= pStart
                const beforePend = d < pEnd
                return afterPstart && beforePend
            })

            const done = periodLogs.reduce((a, c) => {
                return a + c.count
            }, 0)

            periods.unshift({
                done,
                pStart,
                pEnd,
            })

            // Avoid infinite loop
            pStart = new Date(pStart.getTime() + msInPeriod)
            pEnd = new Date(pStart.getTime() + msInPeriod)
        }

        if (!periods.length) return "no progress data yet"

        const thisPeriod = periods.shift()

        const thisPeriodString = `${thisPeriod.done}/${goal.count} ` +
              `${goal.name} completed this ${goal.interval}`

        const finishedPeriods = periods.reduce((a, c) => {
            if (c.done >= goal.count) return {...a, complete: a.complete + 1}
            return {...a, missed: a.missed + 1}
        }, { missed: 0, complete: 0 })

        const allPeriodsString = `Previous ${goal.interval}s: ` +
              `${finishedPeriods.complete}/${periods.length} successful`

        const weeksLeft = `${maxPossiblePeriods - periods.length - 1} ` +
              `full ${goal.interval}s left after this one`

        return `\t${thisPeriodString}\n\t${allPeriodsString}` +
            `\n\t${weeksLeft}`
    }

    const needed = goal.count
    const done = goal.logs.reduce((a, c) => {
        return a + c.count
    }, 0)

    return `\t${done}/${needed} completed`
}

module.exports = { stringifyGoal }
