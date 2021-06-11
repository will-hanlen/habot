const { APIcall } = require('../../util/api')
const { stringifyGoal } = require('../../util/print')
const { encodeNow } = require('../../util/date')
const { Command } = require('discord.js-commando');


const queryTemplate = `
mutation deleteGoal(
  $name: String!
  $user: String!
) {
  delete_goal_by_pk(
    name: $name,
    user: $user
  ) {
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


module.exports = class LogCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'delete',
            aliases: [],
            group: 'habits',
            memberName: 'delete',
            description: 'Delete a habit',
            args: [
                {
                    key: 'name',
                    prompt: 'What is the name of the habit you are logging?',
                    type: 'string',
                },
            ],
        });
    }

    run(message, { name }) {
        const vars = {
            "user": message.author.id,
            "name": name,
        }

        APIcall(
            queryTemplate,
            vars,
            "deleteGoal"
        ).then(data => {

            // send message if no habit with this name exits
            if (!data.delete_goal_by_pk) {
                return message.say(`You don't have a habit called **${name}**`)
            }

            // Return that today already has a log
            message.say(`Deleted **${name}**`)
        })
    }
};
