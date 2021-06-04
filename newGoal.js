const { APIcall } = require('./api')
const { stringifyGoal } = require('./util')

const queryTemplate = `
mutation createGoal(
    $user: String!,
    $count: Int!,
    $activity: String!,
    $interval: Int!,
    $end: timestamptz!,
    $start: timestamptz!,
) {
    insert_goal_one(object: {
        user: $user,
        count: $count
        activity: $activity,
        interval: $interval,
        end: $end,
        start: $start,
    }) {
      user
      activity
      interval
      end
      count
      start
      logs {
        addend
        date
      }
    }
  }
`;

const set = {
    command: "set",
    regex: new RegExp([
        '^',
        '"(?<activity>[A-Za-z0-9 ]+)" ',
        'daily ',
        'for ',
        '(?<duration>[0-9][0-9]) ',
        'weeks',
        '$'
    ].join('')),
    description: "Create a new repeating goal",
    syntax: '!@ "ACTIVITY" [xCOUNT] [every [INTERVAL] day[s]] [starting START] ending END',
    legend: [
        "Goals are tracked by counting the number of times you want to do something",
        "Goals can be repeating or not",
        "",
        "COUNT is a **number** of how many times you want to do ACTIVITY",
        `ACTIVITY is a **phrase** used to reference this goal. \n` +
            `\t\t it is the verb you want to count \n` +
        `INTERVAL is the number of days you want in each interval` +
        `START is a timestamp in the **YYYY-MM-DD** format`,
        `END is a timestamp in the **YYYY-MM-DD** format`,
    ],
    examples: [
        '!@ "pushups" x50 every day ending 2022-01-01',
        '!@ "meditate" every 7 days starting 2021-06-01 ending 2022-01-01',
        '!@ "wake at 5am" every day ending 2021-10-15',
        '!@ "miles ran" x15 every 15 days starting 2021-06-01 ending 2021-01-01',
    ],
    handler: async function(msg, args) {

        const {
            activity,
            frequency = 1,
            duration,
        } = args

        const apiResp = await APIcall(queryTemplate, {
            "user": msg.author.id,
            "activity": activity,
            "frequency": frequency,
            "duration": duration,
        }, "createGoal")

        return stringifyGoal(apiResp['insert_goal_one'])
    },
}

module.exports = { set }
