#! /usr/bin/env node
console.log('Hello jike')



const program = require('commander');

program
    .arguments('<file>')
    .option('-u, --username <username>', 'The user to authenticate as')
    .option('-p, --password <password>', 'The user\'s password')
    .action(function (file) {
        console.log('user: %s pass: %s file: %s',
            program.username, program.password, file);
    })
    .parse(process.argv);