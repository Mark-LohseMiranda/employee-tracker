const mysql = require("mysql2");
const cTable = require("console.table");
const inquirer = require("inquirer");
const util = require("util");
const { resolve } = require("path");

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "p@ssword",
    database: "employees_db",
  },
  console.log(`Connected to the employees_db database.`)
);

const query = util.promisify(db.query).bind(db);

const mainMenu = () => {
  inquirer
    .prompt([
      {
        name: "choice",
        type: "list",
        message: "What do you want to do:",
        choices: [
          "Display Departments",
          "Display Roles",
          "Display Employees",
          "Add Department",
          "Add Role",
          "Add Employee",
          "Update Employee",
          "Quit",
        ],
      },
    ])
    .then((answers) => {
      switch (answers.choice) {
        case "Display Departments":
          displayDepartment();
          break;
        case "Add Department":
          addDepartment();
          break;
        case "Display Roles":
          displayRoles();
          break;
        case "Add Role":
          addRole();
          break;
        case "Display Employees":
          displayEmployee();
          break;
        case "Add Employee":
          addEmployee();
          break;
        default:
          console.log("goodbye");
          process.exit();
      }
    });
};

function displayDepartment() {
  db.query(
    `SELECT department.id 'ID', department.department 'Department' FROM department;`,
    function (err, results) {
      if (err) {
        console.log(err);
      } else {
        console.log("\n");
        console.table(results);
        console.log("\n");
        mainMenu();
      }
    }
  );
}

function displayRoles() {
  db.query(
    `SELECT roles.id 'ID', roles.title 'Title', department.department 'Department', roles.salary 'Salary' FROM roles, department WHERE roles.department_id = department.id;`,
    function (err, results) {
      if (err) {
        console.log(err);
      } else {
        console.log("\n");
        console.table(results);
        console.log("\n");
        mainMenu();
      }
    }
  );
}

function displayEmployee() {
  db.query(
    `SELECT e.id 'ID', CONCAT_WS(', ', e.last_name, e.first_name) 'Name', roles.title 'Title', department.department 'Department', roles.salary 'Salary', CONCAT_WS(', ', m.last_name, m.first_name) 'Manager' FROM roles, department, employee AS e LEFT JOIN employee AS m ON m.id = e.manager_id WHERE e.roles_id = roles.id AND roles.department_id = department.id;`,

    // AND e.roles_id = roles.id AND roles.department_id = department.id;`,
    function (err, results) {
      if (err) {
        console.log(err);
      } else {
        console.log("\n");
        console.table(results);
        console.log("\n");
        mainMenu();
      }
    }
  );
}

function addDepartment() {
  inquirer
    .prompt([
      {
        name: "name",
        type: "input",
        message: "What do you want to name the new department:",
      },
    ])
    .then((answers) => {
      db.query(
        `INSERT INTO department (department) VALUES ("${answers.name}");`,
        function (err, results) {
          if (err) {
            console.log(err);
          } else {
            mainMenu();
          }
        }
      );
    });
}

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
              mainMenu();
            }
          }
        );
      }
      first();
    });
}

function addEmployee() {
  const managerChoiceArray = [];
  let managers = {};
  const rolesArray = [];
  db.query(
    `SELECT id 'ID', CONCAT_WS(', ', last_name, first_name) 'Name' FROM employee;`,
    function (err, results) {
      if (err) {
        console.log(err);
      } else {
        managers = results;
        for (const element of results) {
          managerChoiceArray.push(element.Name);
        }
      }
    }
  );
  db.query(`SELECT * FROM roles;`, function (err, results) {
    if (err) {
      console.log(err);
    } else {
      for (const element of results) {
        rolesArray.push(element.title);
      }
    }
  });
  inquirer
    .prompt([
      {
        name: "firstname",
        type: "input",
        message: "What is the employee's first name:",
      },
      {
        name: "lastname",
        type: "input",
        message: "What is the employee's last name:",
      },
      {
        name: "role",
        type: "list",
        message: "What is the employee's role?",
        choices: rolesArray,
      },
      {
        name: "manager",
        type: "list",
        message: "Who is the employee's manager?",
        choices: managerChoiceArray,
      },
    ])
    .then((answers) => {
      async function getData() {
        let mypromise = new Promise(function (resolve, reject) {
          db.query(
            `SELECT id FROM roles WHERE title = "${answers.role}";`,
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
        let mypromise2 = new Promise(function (resolve, reject) {
          for (i = 0; i < managers.length; i++) {
            if (managers[i].Name === answers.manager) {
              resolve(managers[i].ID);
            }
          }
        });
        console.log(await mypromise2);
        db.query(
          `INSERT INTO employee (first_name, last_name, roles_id, manager_id) VALUES ("${
            answers.firstname
          }","${
            answers.lastname
          }","${await mypromise}", "${await mypromise2}");`,
          function (err, results) {
            if (err) {
              console.log(err);
            } else {
              mainMenu();
            }
          }
        );
      }
      getData();
    });
}

mainMenu();
