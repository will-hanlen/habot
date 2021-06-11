const { APIcall } = require('../../util/api')
const { stringifyGoal } = require('../../util/print')
const { encodeNow } = require('../../util/date')
const { Command } = require('discord.js-commando');

const queryTemplate = `
mutation deleteLog(
  $date: date!
  $name: String!
  $user: String!
) {
  delete_log_by_pk(
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
            name: 'unlog',
            aliases: [],
            group: 'habits',
            memberName: 'unlog',
            description: "Delete a today's log for a habit",
            args: [
                {
                    key: 'name',
                    prompt: 'What is the name of the habit whose log you want to delete?',
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
                // If there is for log today, delete it
                if (data.log_by_pk) return this.deleteLog(message, vars)

                // Return that today already has a log
                message.say(`**${name}** doesn't have a log entry for today to delete`)
            })
    }

    deleteLog(message, vars) {
        APIcall(queryTemplate, vars, "deleteLog")
            .then((data) => {
                console.log(data)
                message.say(`Deleted today's log for your **${vars.name}** habit`)
            })
    }

};

