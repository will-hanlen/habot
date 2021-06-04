const { APIcall } = require('./api')
const { stringifyGoal } = require('./util')

const queryTemplate = `
mutation deleteGoal(
  $activity: String!
  $user: String!
) {
  delete_goal_by_pk(
    activity: $activity,
    user: $user
  ) {
    activity
  }
}
`;

const del = {
    command: "delete",
    regex: new RegExp([
        '^',
        '(?<activity>[A-Za-z0-9 ]+)',
        '$'
    ].join('')),
    description: "Delete a goal",
    syntax: "!@ ACTIVITY",
    legend: [
        "ACTIVITY is the name of the goal you want to delete",
    ],
    examples: [
        '!@ pushups',
    ],
    handler: async function(msg, args) {

        const {
            activity,
        } = args

        const apiResp = await APIcall(queryTemplate, {
            "user": msg.author.id,
            "activity": activity,
        }, "deleteGoal")

        const deleted = apiResp['delete_goal_by_pk']

        if (!deleted) {
            throw `Could not find a goal named ${activity} to delete`
        }

        return `Deleted ${deleted.activity}`


    },
}

module.exports = { del }
