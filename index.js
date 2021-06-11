/********

Will's pet robot named Habot.

Habot tracks your habit goals.
Use it to improve your life!

********/

const dotenv = require('dotenv')
const { CommandoClient } = require('discord.js-commando');
const path = require('path')


// Make secrets accessible
dotenv.config()


// Init the Commando Client
const client = new CommandoClient({
    commandPrefix: '!',
    owner: '392171266292973569',  // That's me
});


// Setup Commando
client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['habits', "Creating, listing, and deleting habits"],
    ])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
    console.log("Ready to Rumble")
    client.user.setActivity('habit tracking')
})


// Authenticate
client.login(process.env.TOKEN);
