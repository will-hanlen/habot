const { APIcall } = require('../../util/api')
const { stringifyGoal } = require('../../util/print')
const { Command } = require('discord.js-commando');


const queryTemplate = `
query listGoals(
    $user: String!,
) {
    goal(where: { user: {_eq: $user }}) {
      user
      name
      type
      start
      duration
      logs {
        date
      }
    }
  }
`;


module.exports = class ListCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'list',
            aliases: [],
            group: 'habits',
            memberName: 'list',
            description: 'List all current habits.',
        });
    }

    run(message) {
        const vars = {
            "user": message.author.id,
        }

        APIcall(queryTemplate, vars, "listGoals")
            .then((data) => {
                const goals = data.goal.map(goal => {
                    return stringifyGoal(
                        goal.name,
                        goal.type,
                        goal.start,
                        goal.duration,
                        goal.logs
                    )
                })

                const fullMessage = goals.join("\n")
                message.say(fullMessage)
            })
    }
};
