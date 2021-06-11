const { APIcall } = require('../../util/api')
const { stringifyGoal } = require('../../util/print')
const { encodeNow } = require('../../util/date')
const { Command } = require('discord.js-commando');


const queryTemplate = `
query allLogs(
  $name: String!
  $user: String!
) {
  log(where: {
    name: {_eq: $name},
    user: {_eq: $user}
  }) {
    user
    date
    name
  }
}
`;


module.exports = class LogCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'history',
            aliases: [],
            group: 'habits',
            memberName: 'history',
            description: 'Show the log history of a habit',
            args: [
                {
                    key: 'name',
                    prompt: 'What is the name of the habit you want to inspect?',
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
            "allLogs"
        ).then(data => {
            console.log(data)
            // Check that the habit exits
            if (!data.log.length) {
                return message.say(`You have no logs for a habit named **${name}**`)
            }

            // Show the history
            const logs = data.log.map(log => {
                return log.date
            })

            const logMessage = logs.join("\n")
            message.say(logMessage)
        })
    }
};
