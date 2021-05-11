/********

Will's pet robot named Robot.

A discord bot.

********/

'use strict';

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
const PREFIX = "#"
const LOGGING = false

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
    if (LOGGING) console.log("Ready!")
});

// Handle incoming bot commands
client.on('message', msg => {
    if (LOGGING) send(msg, 'incoming', msg.content)

    if (!msg.content.startsWith(PREFIX) || msg.author.bot) return;

    // Parse out the command and args
    const input = msg.content.slice(PREFIX.length).trim()

    if (LOGGING) send(msg, 'input', input)

    var firstSpace = input.indexOf(" ")
    if (firstSpace < 1) {
        firstSpace = input.length
    }

    if (LOGGING) send(msg, 'firstSpace', firstSpace)

    const arg0 = input.slice(0, firstSpace)
    const args = input.slice(firstSpace).trim()

    if (LOGGING) msg.channel.send(`arg0: ${arg0}`)
    if (LOGGING) msg.channel.send(`args: ${args}`)

    const command = (arg0 == "") ? "help" : arg0

    // Find the correct handler or use the unknownCommand handler
    const matchedCommand = findCommand(command)

    msg.react(reactions[matchedCommand?.reaction || "robot"])

    // Hanlde the command and send the response
    const handler = matchedCommand.handler
    const dest = matchedCommand?.alwaysDM ? msg.author : msg.channel

    try {
        const params = parser(args, matchedCommand.regex)
        handler(msg, params)
            .then(resp => dest.send(resp))
            .catch(e => {
                dest.send(errorify(e))
            })
    } catch (e) {
        if (e instanceof SyntaxError) {
            dest.send(hydrateError(matchedCommand, e))
        }
        else {
            dest.send(errorify(e))
        }
    }
});

function send(msg, label, value) {
    msg.channel.send(`${label}: ${value}`)
}

// Command Validator

function parser(args, regex) {

    if (LOGGING) console.log(args, regex)

    const found = args.match(regex)

    if (!found) {
        throw SyntaxError("Arguments did not match pattern for this command")
    }

    return found.groups
}

// Authenticate the bot
client.login(process.env.TOKEN);

// Utils

const reactions = {
    robot: "🤖",
    error: "❓",
}

function findCommand(name) {
    const command = commands.find(c => {
        return c.command === name
    })

    // if (!command) throw `Command '${name}' not found`

    if (!command) return help

    return command
}


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

    return space("**SYNTAX**", syntax, fullLegend)
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
    return space("**EXAMPLES**", examples)
}

function hydrateDocstring(command) {
    return space(hydrateSyntax(command), '', hydrateExamples(command))
}

function hydrateError(command, message) {
    const error = errorify(message)
    const correct = hydrateDocstring(command)
    return space(error, correct)
}


// Commands
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
        return commands.map(c => hydrateDefinition(c)).join("\n")
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
