const mysql = require("mysql2");
const cTable = require("console.table");
const inquirer = require("inquirer");

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "p@ssword",
    database: "employees_db",
  },
  console.log(`Connected to the books_db database.`)
);

const mainMenu = () => {
  inquirer
    .prompt([
      {
        name: "choice",
        type: "list",
        message: "What do you want to do:",
        choices: [
          "Display Departments",
          "Add Department",
          "Display Roles",
          "Add Role",
          "Display Employees",
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
        default:
          console.log("goodbye");
          process.exit();
      }
    });
};

function displayDepartment() {
  db.query(`SELECT department.id 'ID', department.department 'Department' FROM department;`, function (err, results) {
    if (err) {
      console.log(err);
    } else {
      console.log("\n");
      console.table(results);
      console.log("\n");
      mainMenu();
    }
  });
}

function displayRoles() {
  db.query(
    `SELECT roles.id 'ID', roles.title 'Title', department.department 'Department', roles.salary 'Salary' FROM roles, department WHERE roles.department_id = department.id;`,
    function (err, results) {
      if(err) {
        console.log(err);
      } else {
        console.log("\n");
        console.table(results);
        console.log("\n");
        mainMenu();
      }
    }
  )

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

mainMenu();
