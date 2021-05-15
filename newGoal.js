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
        '(?:',
          'x(?<count>[1-9]+) ',
        ')?',
        '(?:',
          'every ',
          '(?<interval>[1-9]+)? ',
          'days? ',
        ')?',
        '(?:',
          'starting ',
          '(?<start>\\d{4}-\\d{2}-\\d{2}) ?',
        ')?',
        'ending ',
        '(?<end>\\d{4}-\\d{2}-\\d{2}) ?',
        '$'
    ].join('')),
    description: "Create a new repeating goal",
    syntax: '!@ "ACTIVITY" [xCOUNT] [every [INTERVAL] day[s]] [starting START] ending END',
    legend: [
        "COUNT is a **number** of how many times you want to do NAME",
        `ACTIVITY is a **phrase** used to reference this goal. \n` +
            `\t\t it is the verb you want to count \n` +
        `INTERVAL is the number of days you want in each interval` +
        `START is a timestamp in the **YYYY-MM-DD** format`,
        `END is a timestamp in the **YYYY-MM-DD** format`,
    ],
    examples: [
        "!@ 50 pushups every day until 2022-01-01",
        "!@ 4 meditations per week until 2022-01-01",
        "!@ essay every 15 days until 2021-10-15",
    ],
    handler: async function(msg, args) {

        const {
            activity,
            count = 1,
            interval = 1,
            start = new Date().toISOString(),
            end,
        } = args

        const apiResp = await APIcall(queryTemplate, {
            "user": msg.author.id,
            "count": count,
            "activity": activity,
            "interval": interval,
            "start": start,
            "end": end,
        }, "createGoal")

        return stringifyGoal(apiResp['insert_goal_one'])
    },
}

module.exports = { set }
