const { APIcall } = require('./api')
const { stringifyGoal } = require('./util')

const queryTemplate = `
mutation logProgress(
  $addend: Int!
  $date: timestamptz!
  $name: String!
  $user: String!
) {
  insert_log_one(object: {
    addend: $addend,
    date: $date,
    name: $name,
    user: $user
  }) {
    date
    addend
    user
    name
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
        '(?<name>\\w+) ?',
        '(?:on (?<date>\\d{4}-\\d{2}-\\d{2}))?',
        '$'
    ].join('')),
    description: "Log progress on a goal",
    syntax: "!@ [ADDEND] NAME [on DATE]",
    legend: [
        "[ADDEND] is the number of NAME that you did.  Defaults to 1.",
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
            addend = 1,
            name,
            date = new Date().toISOString(),
        } = args

        const apiResp = await APIcall(queryTemplate, {
            "user": msg.author.id,
            "name": name,
            "addend": addend,
            "date": date,
        }, "logProgress")

        return stringifyGoal(apiResp['insert_log_one']['goal'])

    },
}

module.exports = { log }
