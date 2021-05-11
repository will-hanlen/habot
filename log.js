const { APIcall } = require('./api')
const { stringifyGoal } = require('./util')

const queryTemplate = `
mutation logProgress(
  $count: Int!
  $date: timestamptz!
  $name: String!
  $user: String!
) {
  insert_log_one(object: {
    count: $count,
    date: $date,
    name: $name,
    user: $user
  }) {
    date
    count
    user
    name
    goal {
      name
      user
      count
      delim1
      delim2
      interval
      frequency
      end
      start
      logs {
        date
        count
      }
    }
  }
}
`;

const log = {
    command: "log",
    regex: new RegExp([
        '^',
        '(?<count>\\d+)? ?',
        '(?<name>\\w+) ?',
        '(?:on (?<date>\\d{4}-\\d{2}-\\d{2}))?',
        '$'
    ].join('')),
    description: "Log progress on a goal",
    syntax: "!@ [COUNT] NAME [on DATE]",
    legend: [
        "[COUNT] is the number of NAME that you did.  Defaults to 1.",
        "NAME is the name of the goal you made progress on",
        "[DATE] is the date when you made the progress. Defaults to today.",
    ],
    examples: [
        "!@ 45 pushups",
        "!@ meditation",
        "!@ nosugar on 2021-04-02",
    ],
    handler: async function(msg, args) {

        const {
            count = 1,
            name,
            date = new Date().toISOString(),
        } = args

        const apiResp = await APIcall(queryTemplate, {
            "user": msg.author.id,
            "name": name,
            "count": count,
            "date": date,
        }, "logProgress")

        return stringifyGoal(apiResp['insert_log_one']['goal'])

    },
}

module.exports = { log }
