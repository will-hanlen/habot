const { APIcall } = require('../../util/api')
const { stringifyGoal } = require('../../util/print')
const { encodeNow } = require('../../util/date')
const { Command } = require('discord.js-commando');

const queryTemplate = `
mutation logProgress(
  $date: date!
  $name: String!
  $user: String!
) {
  insert_log_one(object: {
    date: $date,
    name: $name,
    user: $user
  }) {
    goal {
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
}

query checkExistingGoal(
  $name: String!
  $user: String!
) {
  log(where: {
    name: {_eq: $name}
    user: {_eq: $user}
  }) {
    name
  }
}

query checkExistingLog(
  $date: date!
  $name: String!
  $user: String!
) {
  log_by_pk(
    date: $date,
    name: $name,
    user: $user
  ) {
    goal {
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
}
`;


module.exports = class LogCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'log',
            aliases: [],
            group: 'habits',
            memberName: 'log',
            description: 'Log activity for a habit',
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
            "date": encodeNow(),
        }

        APIcall(queryTemplate, vars, "checkExistingLog")
            .then(data => {
                // If there isn't already a log today, create one
                if (!data.log_by_pk) return this.createLog(message, vars)

                // Return that today already has a log
                message.say(`**${name}** already has already been logged today`)
            })
    }

    createLog(message, vars) {
        APIcall(queryTemplate, vars, "logProgress")
            .then((data) => {
                const goal = data['insert_log_one'].goal
                console.log(goal)
                const goalText = stringifyGoal(
                    goal.name,
                    goal.type,
                    goal.start,
                    goal.duration,
                    goal.logs
                )
                message.say(goalText)
            }).catch(error => {
                if (error.includes("log_user_name_fkey")) {
                    message.say(`You don't have a habit named **${vars.name}**`)
                } else {
                    message.say(error)
                }
            })
    }
};
