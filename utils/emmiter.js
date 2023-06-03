const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

/**
 * @param {EventEmitter} emmiter 
 */
module.exports = ( emmiter ) => {
    const eventsFolder = path.join(process.cwd(), 'events');
    const eventFiles = fs.readdirSync(eventsFolder);
    eventFiles.forEach( evFile => {
        if( fs.statSync(path.join(eventsFolder, evFile)).isDirectory() ) return;
        try {
            const { event, execute } = require(path.join(eventsFolder, evFile))
            emmiter.on(event, execute);

        } catch (error) {
            console.log("Error while loading event files:");
            console.log(error);
        }
    });
}