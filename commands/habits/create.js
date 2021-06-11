const { APIcall } = require('../../util/api')
const { stringifyGoal } = require('../../util/print')
const { encodeNow } = require('../../util/date')
const { Command } = require('discord.js-commando');


const queryTemplate = `
mutation createHabit(
  $name: String!
  $user: String!
  $type: String!
  $start: date!
  $duration: Int!
) {
  insert_goal_one(object: {
    name: $name
    user: $user
    type: $type
    duration: $duration
    start: $start
  }) {
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


module.exports = class MeowCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'create',
            aliases: [],
            group: 'habits',
            memberName: 'create',
            description: 'Creates a new habit.',
            args: [
                {
                    key: 'name',
                    prompt: 'What is the name of this habit?',
                    type: 'string',
                },
                {
                    key: 'type',
                    prompt: "'daily' or 'never'?",
                    oneOf: ['daily', 'never'],
                    type: 'string',
                },
                {
                    key: 'duration',
                    prompt: 'How many weeks will your goal last?',
                    type: 'integer',
                },
            ],
        });
    }

    run(message, { name, type, duration }) {

        const vars = {
            "name": name,
            "type": type,
            "duration": duration,
            "user": message.author.id,
            "start": encodeNow(),
        }
        APIcall(
            queryTemplate,
            vars,
            "createHabit"
        ).then(data => {
            message.say(`${message.author} created a habit:\n**${name}** ${type} for ${duration} weeks!`)
        }).catch(error => {
            if (error.includes("goal_pkey")) {
                message.say(`Error: You already have a habit called **${name}**`)
            } else {
                message.say(error)
            }
        })
    }
};
