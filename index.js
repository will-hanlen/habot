/********

Will's pet robot named Robot.

A discord bot.

********/

const dotenv = require('dotenv')
const { Client } = require('discord.js');

// Programs
const { set } = require('./newGoal');
const { list } = require('./list');
const { log } = require('./log');
const { del } = require('./delete');

// Setup
dotenv.config()
const client = new Client();

// Settings
const PREFIX = "!"

// Start the discort bot
client.on('ready', () => {
    // Make sure every command has all the required attributes

    commands.forEach(e => {
        if (!e.command) throw "Missing command"
        if (!e.description) throw "Missing description"
        if (!e.handler) throw "Missing handler"
        if (!e.syntax) throw "Missing syntax"
        if (!e.regex) throw "Missing regex"
        if (!e.legend) throw "Missing syntax"
        if (!e.examples) throw "Missing syntax"
    })
    console.log("Server Ready!")
});

// Parse incoming bot commands
client.on('message', msg => {

    // Ensure message is to the bot
    if (!msg.content.startsWith(PREFIX) || msg.author.bot) return;

    // Parse out the command and args
    const input = msg.content.slice(PREFIX.length).trim()

    var firstSpace = input.indexOf(" ")
    if (firstSpace < 1) {
        firstSpace = input.length
    }

    const arg0 = input.slice(0, firstSpace) || "help"
    const args = input.slice(firstSpace).trim()

    // Match the first argument with a command
    const command = commands.find(c => {
        return c.command === arg0
    })

    respond(msg, command, args).then(resp => {
        msg.channel.send(resp)
    }).catch(e => {
        console.error(e)
        msg.channel.send(errorify(e))
    })

});

async function respond(msg, command, args) {
    if (!command) {
        msg.react("❓")
        throw "Unknown Command"
    }
    msg.react("🤖")

    return await command.handler(msg, parser(args, command.regex))
}

function parser(args, regex) {

    const found = args.match(regex)

    if (!found) {
        throw SyntaxError("Arguments did not match pattern for this command")
    }

    return found.groups
}

// Authenticate the bot
client.login(process.env.TOKEN);


// Formatting

function space() {
    const args = [...arguments]
    return args.map(a => a ).join("\n")
}

function codeify(string) {
    return `\` ${string} \``
}

function blockify(message) {
    return `\`\`\`\n`
          .concat(message)
          .concat(`\n\`\`\``)
}

function errorify(message) {
    return `\`\`\`css\n[ `
          .concat(message)
          .concat(`\`\`\``)
}

// Printing

function hydrateSymbols(command, string) {
    return string.replace(/^\!/g, PREFIX).replace(/@/g, command.command)
}

function hydrateSyntax(command) {
    const syntax = blockify(hydrateSymbols(command, command.syntax))
    const legend = command.legend.map(e => {
        return "\t" + e.replace(/[A-Z]+/g, (m) => `\`${m}\``)
    }).join("\n")

    const fullLegend = (legend.length) ? space(
        "WHERE:", legend, "(variables in brackets are optional)") : ""

    return space(syntax, fullLegend)
}

function hydrateDefinition(command) {
    const description = command.description
    const definition = "\t" + codeify(hydrateSymbols(command, command.syntax))

    return space("", description, definition)
}

function hydrateExamples(command) {
    const examples = command.examples.map(e => (
        blockify(hydrateSymbols(command, e))
    )).join("\n")
    return space("Examples:", examples)
}

function hydrateDocstring(command) {
    const name = `**${command.command.toUpperCase()}**`
    return space('---------', '',name, '', hydrateSyntax(command), '', hydrateExamples(command))
}

function hydrateError(command, message) {
    const error = errorify(message)
    const correct = hydrateDocstring(command)
    return space(error, correct)
}

const help = {
    command: "help",
    description: "Get help on a command",
    syntax: "!@ [COMMAND]",
    legend: [
        "COMMAND is a command to read about"
    ],
    examples: [
        "!@ nrg",
    ],
    regex: new RegExp([
        '(?<com>\\w+)?',
    ].join('')),
    alwaysDM: true,
    reaction: "robot",
    handler: async function(msg, args) {

        const { com } = args

        if (com) {
            const c = findCommand(com)
            return hydrateDocstring(c)
        }
        const manual = commands.map(c => hydrateDocstring(c)).join("\n")
        msg.author.send(manual)
        return "Sent you a DM with the manual"
    },
}

// Possible commands
const commands = [
    help,
    set,
    list,
    log,
    del,
]
