const { APIcall } = require('./api')
const { stringifyGoal } = require('./util')

const queryTemplate = `
mutation deleteGoal(
  $name: String!
  $user: String!
) {
  delete_goal_by_pk(
    name: $name,
    user: $user
  ) {
    name
  }
}
`;

const del = {
    command: "delete",
    regex: new RegExp([
        '^',
        '(?<name>\\w+)',
        '$'
    ].join('')),
    description: "Delete a goal",
    syntax: "!@ NAME",
    legend: [
        "NAME is the name of the goal you want to delete",
    ],
    examples: [
        "!@ pushups",
    ],
    handler: async function(msg, args) {

        const {
            name,
        } = args

        const apiResp = await APIcall(queryTemplate, {
            "user": msg.author.id,
            "name": name,
        }, "deleteGoal")

        const deleted = apiResp['delete_goal_by_pk']

        if (!deleted) {
            throw `Could not find a goal named ${name} to delete`
        }

        return `Deleted ${deleted.name}`


    },
}

module.exports = { del }
