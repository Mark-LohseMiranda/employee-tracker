const mysql = require("mysql2");
const cTable = require("console.table");
const inquirer = require("inquirer");
const util = require("util");
const { resolve } = require("path");
let employees = {};

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "p@ssword",
    database: "employees_db",
  },
  console.log(`Connected to the employees_db database.`)
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
          "Display Roles",
          "Display Employees",
          "Add Department",
          "Add Role",
          "Add Employee",
          "Update Employee Role",
          "Quit",
        ],
      },
    ])
    .then((answers) => {
      switch (answers.choice) {
        case "Display Departments":
          display(
            `SELECT department.id 'ID', department.department 'Department' FROM department;`
          );
          break;
        case "Add Department":
          addDepartment();
          break;
        case "Display Roles":
          display(
            `SELECT roles.id 'ID', roles.title 'Title', department.department 'Department', roles.salary 'Salary' FROM roles, department WHERE roles.department_id = department.id;`
          );
          break;
        case "Add Role":
          addRole();
          break;
        case "Display Employees":
          display(
            `SELECT e.id 'ID', CONCAT_WS(', ', e.last_name, e.first_name) 'Name', roles.title 'Title', department.department 'Department', roles.salary 'Salary', CONCAT_WS(', ', m.last_name, m.first_name) 'Manager' FROM roles, department, employee AS e LEFT JOIN employee AS m ON m.id = e.manager_id WHERE e.roles_id = roles.id AND roles.department_id = department.id;`
          );
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Update Employee Role":
          updateRole();
          break;
        default:
          console.log("goodbye");
          process.exit();
      }
    });
};

function display(data) {
  db.query(data, (err, results) => {
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
      const query = `INSERT INTO department (department) VALUES (?);`;
      db.query(query, answers.name, (err, results) => {
        if (err) {
          console.log(err);
        } else {
          mainMenu();
        }
      });
    });
}

function addRole() {
  const choicesList = [];
  db.query(`SELECT * FROM department;`, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      for (const element of results) {
        choicesList.push(element.department);
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
        choices: choicesList,
      },
    ])
    .then(async (answers) => {
      let getDeptId = new Promise((resolve, reject) => {
        const query = `SELECT id FROM department WHERE department = ?;`;
        db.query(query, answers.department, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results[0].id);
          }
        });
      });

      db.query(
        `INSERT INTO roles (title, salary, department_id) VALUES (?,?,?)`,
        [`${answers.name}`, `${answers.salary}`, `${await getDeptId}`],
        (err, results) => {
          if (err) {
            console.log(err);
          } else {
            mainMenu();
          }
        }
      );
    });
}

const employeeChoiceArray = () => {
  const tempArray = [];
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id 'ID', CONCAT_WS(', ', last_name, first_name) 'Name' FROM employee;`,
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          employees = results;
          for (const element of results) {
            tempArray.push(element.Name);
          }
          tempArray.push("None");
          resolve(tempArray);
        }
      }
    );
  });
};

const rolesArray = () => {
  const tempArray = [];
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM roles;`, (err, results) => {
      if (err) {
        reject(err);
      } else {
        for (const element of results) {
          tempArray.push(element.title);
        }
        resolve(tempArray);
      }
    });
  });
};

const getRoleId = (data) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id FROM roles WHERE title = "${data}";`,
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0].id);
        }
      }
    );
  });
};

const getEmployeeId = (data) => {
  return new Promise((resolve, reject) => {
    for (i = 0; i < employees.length; i++) {
      if (employees[i].Name === data) {
        resolve(employees[i].ID);
      }
    }
    resolve(null);
  });
};

async function addEmployee() {
  await employeeChoiceArray();
  await rolesArray();
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
        choices: employeeChoiceArray,
      },
    ])
    .then(async (answers) => {
      db.query(
        `INSERT INTO employee (first_name, last_name, roles_id, manager_id) VALUES (?,?,?,?)`,
        [
          `${answers.firstname}`,
          `${answers.lastname}`,
          await getRoleId(answers.role),
          await getEmployeeId(answers.manager),
        ],
        (err, results) => {
          if (err) {
            console.log(err);
          } else {
            mainMenu();
          }
        }
      );
    });
}

async function updateRole() {
  await employeeChoiceArray();
  await rolesArray();
  inquirer
    .prompt([
      {
        name: "employee",
        type: "list",
        message: "Which employee do you want to update:",
        choices: employeeChoiceArray,
      },
      {
        name: "role",
        type: "list",
        message: "Which role do you want to assign:",
        choices: rolesArray,
      },
    ])
    .then(async (answers) => {
      await getEmployeeId(answers.employee);
      const query = "UPDATE employee SET roles_id=? WHERE id=?";
      db.query(
        query,
        [await getRoleId(answers.role), await getEmployeeId(answers.employee)],
        (err, data) => {
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
