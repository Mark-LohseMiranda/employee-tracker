const inquirer = require('inquirer');
const mysql = require("mysql2");

const db = mysql.createConnection(
    {
      host: "localhost",
      user: "root",
      password: "p@ssword",
      database: "employees_db",
    },
    console.log(`Connected to the employees_db database.`)
  );

function addRole() {
    const newArray = [];
    db.query(`SELECT * FROM department;`, function (err, results) {
      if (err) {
        console.log(err);
      } else {
        for (const element of results) {
          newArray.push(element.department);
        }
      }
    });
    inquirer
      .prompt([
        {
          name: "name",
          type: "input",
          message: "What is the name of the role:",
        },
        {
          name: "salary",
          type: "number",
          message: "What is the salary of the role:",
        },
        {
          name: "department",
          type: "list",
          message: "Which department does the role belong to:",
          choices: newArray,
        },
      ])
      .then((answers) => {
        async function first() {
          let mypromise = new Promise(function (resolve, reject) {
            db.query(
              `SELECT id FROM department WHERE department = "${answers.department}";`,
              function (err, results) {
                if (err) {
                  console.log(err);
                  reject(err);
                } else {
                  resolve(results[0].id);
                }
              }
            );
          });
          db.query(
            `INSERT INTO roles (title, salary, department_id) VALUES ("${
              answers.name
            }","${answers.salary}","${await mypromise}");`,
            function (err, results) {
              if (err) {
                console.log(err);
              } else {
                // mainMenu();
              }
            }
          );
        }
        first();
      });
  }


module.exports = addRole;