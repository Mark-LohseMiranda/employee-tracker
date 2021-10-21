const inquirer = require('inquirer');

const mainMenu = () => {
    inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: 'What is the department name:'
        },
    ]).then(({name})=> {
        return(name);
    })
}

module.exports = mainMenu;