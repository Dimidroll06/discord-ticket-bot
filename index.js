console.log(
    `  
\x1b[32m 	
\x1b[32m  ▄▄▄█████▓ ██▓ ▄████▄   ██ ▄█▀▓█████▄▄▄█████▓    ▄▄▄▄    ▒█████  ▄▄▄█████▓
\x1b[32m  ▓  ██▒ ▓▒▓██▒▒██▀ ▀█   ██▄█▒ ▓█   ▀▓  ██▒ ▓▒   ▓█████▄ ▒██▒  ██▒▓  ██▒ ▓▒
\x1b[32m  ▒ ▓██░ ▒░▒██▒▒▓█    ▄ ▓███▄░ ▒███  ▒ ▓██░ ▒░   ▒██▒ ▄██▒██░  ██▒▒ ▓██░ ▒░
\x1b[32m  ░ ▓██▓ ░ ░██░▒▓▓▄ ▄██▒▓██ █▄ ▒▓█  ▄░ ▓██▓ ░    ▒██░█▀  ▒██   ██░░ ▓██▓ ░ 
\x1b[32m    ▒██▒ ░ ░██░▒ ▓███▀ ░▒██▒ █▄░▒████▒ ▒██▒ ░    ░▓█  ▀█▓░ ████▓▒░  ▒██▒ ░ 
\x1b[32m    ▒ ░░   ░▓  ░ ░▒ ▒  ░▒ ▒▒ ▓▒░░ ▒░ ░ ▒ ░░      ░▒▓███▀▒░ ▒░▒░▒░   ▒ ░░   
\x1b[32m      ░     ▒ ░  ░  ▒   ░ ░▒ ▒░ ░ ░  ░   ░       ▒░▒   ░   ░ ▒ ▒░     ░    
\x1b[32m    ░       ▒ ░░        ░ ░░ ░    ░    ░          ░    ░ ░ ░ ░ ▒    ░      
\x1b[32m            ░  ░ ░      ░  ░      ░  ░            ░          ░ ░           
\x1b[32m               ░                                       ░                   
\x1b[0m 
    `
);

// require all stuff
const { Client, Events, GatewayIntentBits } = require('discord.js');
const EventEemmiter = require('events');
const jsonc = require('jsonc');
const path = require('path');
const fs = require('fs');

// ts-types
const { QuickDB } = require('quick.db');

// log unexpected errors without closing process
process.on('uncaughtException', (e)=>{
	console.log(e);
});

// init client variable
var client = new Client({ intents: [GatewayIntentBits.Guilds] });

// init configs
client.config = {
    tickets: jsonc.parse(fs.readFileSync(path.join(process.cwd(), 'configs', 'tickets.jsonc'), "utf8")),
    bot: jsonc.parse(fs.readFileSync(path.join(process.cwd(), 'configs', 'bot.jsonc'), "utf8")),
    db: jsonc.parse(fs.readFileSync(path.join(process.cwd(), 'configs', 'db.jsonc'), "utf8")),
};

// init db
(async()=>{
    client.db = await require('./utils/db.js')(client);
    client.temp = await client.db.get('temp');
})();

// init locales
try {
    client.locales = require(path.join(process.cwd(), 'locales', client.config.bot.locales));
} catch (e) {
    console.log(`File ${path.join(process.cwd(), 'locales', client.config.bot.locales)} is undefinded`);
    process.exit(0);
};

// main event
client.once(Events.ClientReady, () => {
    client.ticketEmmiter.emit("clientReady", client);
});

// init custom emmiter
client.ticketEmmiter = new EventEemmiter();
require('./utils/emmiter')(client.ticketEmmiter);

// login
client.login(client.config.bot.token);

/**
    MIT License
    
    Copyright (c) 2023 Dmitry
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
**/