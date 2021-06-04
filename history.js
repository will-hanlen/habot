const { APIcall } = require('./api')
const { stringifyGoal } = require('./util')

const queryTemplate = `
query allLogs(
  $activity: String!
  $user: String!
) {
  log(where: {
    user: {_eq: $user},
    activity: {_eq: $activity},
  }) {
    date,
    addend
  }
}
`;

const history = {
    command: "history",
    regex: new RegExp([
        '^',
        '"(?<activity>[A-Za-z0-9 ]+)"',
        '$'
    ].join('')),
    description: "All the logs of a goal",
    syntax: '!@ "ACTIVITY"',
    legend: [
        "ACTIVITY is the name of the goal you want to inspect",
    ],
    examples: [
        `!@ "pushups"`,
    ],
    handler: async function(msg, args) {

        const {
            activity
        } = args

        const apiResp = await APIcall(queryTemplate, {
            "user": msg.author.id,
            "activity": activity,
        }, "allLogs")

        const logs = apiResp['log']

        if (!logs) {
            throw `Could not find a goal named ${activity}`
        }

        const output = logs.map(l => {
            return `${l.addend}\t${l.date}`
        }).join("\n")

        return output


    },
}

module.exports = { history }
