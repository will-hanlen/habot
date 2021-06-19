const { APIcall } = require('./api')

function stringifyGoal(name, type, start, duration, logs) {
    const summary = summaryLine(name, type, duration)
    const progress = progressLine(type, logs, duration)
    return `${summary}\n${progress}`
}

function progressLine(type, logs, duration) {
    const numLogs = logs.length
    const maxDays = duration * 7

    if (type == 'daily') {
        return `${numLogs} / ${maxDays}`
    }

    return `Broken ${numLogs} times`
}

function summaryLine(name, type, duration) {
    return `**${name}** ${type} for ${duration} weeks`
}

function sstringifyGoal(data) {

    const user = data.user
    const activity = `**${data.activity}** `
    const count = (data.count > 1) ? `x${data.count} ` : ''
    const dayWord = (data.interval > 1) ? "days" : "day"
    const intervalDisplay = (data.interval > 1) ? `${data.interval} ` : ''
    const interval = (data.interval) ?
          `\n\t${data.count} every ${intervalDisplay}${dayWord}`
          : ''
    const start = `\n\t[ ${prettyDate(data.start)} → `
    const end = `${prettyDate(data.end)} ]`

    const dates = start + end

    const goal = activity + interval

    const progress = progressMeter(data)

    return goal + "\n" + progress + dates

}

function prettyDate(date) {
    const d = new Date(date)
    const year = d.getUTCFullYear()
    const month = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function progressMeter(goal) {
    const recurring = goal.interval // whether goal has an interval clause

    if (recurring) {
        const dayWord = (goal.interval > 1) ? "days" : "day"

        const daysInPeriod = goal.interval

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
                return a + c.addend
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
              `completed this interval`

        const finishedPeriods = periods.reduce((a, c) => {
            if (c.done >= goal.count) return {...a, complete: a.complete + 1}
            return {...a, missed: a.missed + 1}
        }, { missed: 0, complete: 0 })

        const allPeriodsString = (periods.length) ? `\n\tPrevious intervals: ` +
              `${finishedPeriods.complete}/${periods.length} successful` : ''


        const intervalsLeft = maxPossiblePeriods - periods.length -1
        const daysLeft = intervalsLeft * goal.interval

        const timeLeft = (intervalsLeft == daysLeft) ?
              `${daysLeft} days left in goal` :
              `${daysLeft} days left in goal (${intervalsLeft} intervals)`

        const weeksLeft = `${maxPossiblePeriods - periods.length - 1} ` +
              `full intervals left after this one (${daysLeft} days)`

        return `\t${thisPeriodString}${allPeriodsString}` +
            `\n\t${timeLeft}`
    }

    const needed = goal.count
    const done = goal.logs.reduce((a, c) => {
        return a + c.addend
    }, 0)

    const daysLeft = Math.floor((new Date(goal.end) - Date.now()) / 86400000)
    const timeLeft = `\n\t${daysLeft} days left in goal`

    return `\t${done}/${needed} completed` + timeLeft
}

module.exports = { stringifyGoal }
