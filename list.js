const { APIcall } = require('./api')
const { stringifyGoal } = require('./util')

const queryTemplate = `
query listGoals(
    $user: String!,
) {
    goal(where: { user: {_eq: $user }}) {
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
        date
        count
      }
    }
  }
`;

const list = {
    command: "list",
    regex: new RegExp([
        '^',
        '$'
    ].join('')),
    description: "List goals",
    syntax: "!@",
    legend: [],
    examples: [
        "!@",
    ],
    handler: async function(msg, args) {

        const apiResp = await APIcall(queryTemplate, {
            "user": msg.author.id,
        }, "listGoals")

        const goals = apiResp.goal.map(goal => {
            return stringifyGoal(goal)
        }).join("\n\n")

        if (!goals.length) {
            return "You haven't set any goals yet"
        }

        return goals
    },
}


module.exports = { list }
