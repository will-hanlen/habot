const { APIcall } = require('./api')
const { stringifyGoal } = require('./util')

const queryTemplate = `
mutation createGoal(
    $user: String!,
    $count: Int,
    $name: String!,
    $delim1: String,
    $frequency: Int,
    $interval: String,
    $delim2: String!,
    $end: timestamptz!,
    $start: timestamptz!,
) {
    insert_goal_one(object: {
        user: $user,
        count: $count
        name: $name,
        delim1: $delim1,
        frequency: $frequency,
        interval: $interval,
        delim2: $delim2,
        end: $end,
        start: $start,
    }) {
      user
      name
      interval
      frequency
      delim1
      delim2
      end
      count
      start
      logs {
        count
        date
      }
    }
  }
`;

const set = {
    command: "set",
    regex: new RegExp([
        '^(?<count>\\d+)? ?',
        '(?<name>\\w+) ',
        '(?:',
        '(?<delim1>(?:every)|(?:per)) ',
        '(?<frequency>\\d+)? ',
        '?(?<interval>\\D+) ',
        ')?',
        '(?<delim2>\\w+) ',
        '(?<end>\\d{4}-\\d{2}-\\d{2}) ?',
        '(?:starting (?<start>\\d{4}-\\d{2}-\\d{2}))?',
        '$'
    ].join('')),
    description: "Create a new repeating goal",
    syntax: "!@ [COUNT] NAME [DELIM1 [FREQUENCY] INTERVAL] DELIM2 END [starting START]",
    legend: [
        "COUNT is a **number** of how many times you want to do NAME",
        `NAME is a single **word** used to reference this goal. \n` +
            `\t\t NAME should be a noun. \n` +
            `\t\t if COUNT > 1, NAME should be plural`,
        "DELIM1 is either '**every**', or '**per**'",
        "FREQUENCY is a **number**",
        `INTERVAL is either 'day', 'days', 'week', 'weeks', 'month', or ` +
            `months'`,
        `DELIM2 is either '**until**' or '**by**'`,
        `END is a timestamp in the **YYYY-MM-DD** format`,
        `START is a timestamp in the **YYYY-MM-DD** format`,
    ],
    examples: [
        "!@ 50 pushups every day until 2022-01-01",
        "!@ 4 meditations per week until 2022-01-01",
        "!@ essay every 15 days until 2021-10-15",
    ],
    handler: async function(msg, args) {

        const {
            count,
            name,
            frequency,
            interval,
            delim1,
            delim2,
            end,
            start = new Date().toISOString(),
        } = args

        const apiResp = await APIcall(queryTemplate, {
            "user": msg.author.id,
            "count": count,
            "name": name,
            "delim1": delim1,
            "frequency": frequency,
            "interval": interval,
            "delim2": delim2,
            "end": end,
            "start": start,
        }, "createGoal")

        return stringifyGoal(apiResp['insert_goal_one'])
    },
}

module.exports = { set }
