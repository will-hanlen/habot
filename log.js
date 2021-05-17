const { APIcall } = require('./api')
const { stringifyGoal } = require('./util')

const queryTemplate = `
mutation logProgress(
  $addend: Int!
  $date: timestamptz!
  $activity: String!
  $user: String!
) {
  insert_log_one(object: {
    addend: $addend,
    date: $date,
    activity: $activity,
    user: $user
  }) {
    date
    addend
    user
    activity
    goal {
      user
      activity
      count
      interval
      start
      end
      logs {
        date
        addend
      }
    }
  }
}
`;

const log = {
    command: "log",
    regex: new RegExp([
        '^',
        '(?<addend>\\d+)? ?',
        '(?<activity>[A-Za-z0-9 ]+) ?',
        '(?:on (?<date>\\d{4}-\\d{2}-\\d{2}))?',
        '$'
    ].join('')),
    description: "Log progress on a goal",
    syntax: "!@ [ADDEND] ACTIVITY [on DATE]",
    legend: [
        "[ADDEND] is the number of NAME that you did.  Defaults to 1.",
        "ACTIVITY is the name of the goal you made progress on",
        "[DATE] is the date when you made the progress. Defaults to today.",
    ],
    examples: [
        "!@ 45 pushups",
        "!@ meditation",
        "!@ nosugar on 2021-04-02",
    ],
    handler: async function(msg, args) {

        const {
            addend = 1,
            activity,
            date = new Date().toISOString(),
        } = args

        const apiResp = await APIcall(queryTemplate, {
            "user": msg.author.id,
            "activity": activity,
            "addend": addend,
            "date": date,
        }, "logProgress")

        return stringifyGoal(apiResp['insert_log_one']['goal'])

    },
}

module.exports = { log }
