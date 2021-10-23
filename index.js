const mysql = require("mysql2");
const cTable = require("console.table");
const inquirer = require("inquirer");
// const util = require("util");
// const { resolve } = require("path");
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
          "Update Employee",
          "Quit",
        ],
      },
    ])
    .then(async(answers) => {
      switch (answers.choice) {
        case "Display Departments":
        console.log('before display')  
        await display(
            `SELECT department.id 'ID', department.department 'Department' FROM department;`
          );
          console.log('after display')
          mainMenu();
          break;
        case "Display Roles":
          await display(
            `SELECT roles.id 'ID', roles.title 'Title', department.department 'Department', roles.salary 'Salary' FROM roles, department WHERE roles.department_id = department.id;`
          );
          mainMenu();
          break;
        case "Display Employees":
          await display(
            `SELECT e.id 'ID', CONCAT_WS(', ', e.last_name, e.first_name) 'Name', roles.title 'Title', department.department 'Department', roles.salary 'Salary', CONCAT_WS(', ', m.last_name, m.first_name) 'Manager' FROM roles, department, employee AS e LEFT JOIN employee AS m ON m.id = e.manager_id WHERE e.roles_id = roles.id AND roles.department_id = department.id;`
          );
          mainMenu();
          break;
        case "Add Department":
          addDepartment();
          break;
        case "Add Role":
          addRole();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Update Employee":
          updateEmployee();
          break;
        default:
          console.log("goodbye");
          process.exit();
      }
    });
};

const display = (data) => {
  return new Promise((resolve, reject) => {
    db.query(data, (err, results) => {
      if (err) {
        reject(err);
      } 
        console.log("\n");
        resolve(console.table(results))      
    });
  })
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

async function addRole() {
  await departmentChoiceArray();
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
        choices: departmentChoiceArray,
      },
    ])
    .then(async (answers) => {
      db.query(
        `INSERT INTO roles (title, salary, department_id) VALUES (?,?,?)`,
        [`${answers.name}`, `${answers.salary}`, `${await getDepartmentId(answers.department)}`],
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

const departmentChoiceArray = () => {
  const tempArray = [];
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM department;`, (err, results) => {
      if (err) {
        reject(err);
      } else {
        for (const element of results) {
          tempArray.push(element.department);
        }
        resolve(tempArray);
      }
    });
  })
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

const getDepartmentId = (data) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id FROM department WHERE department = "${data}";`,
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

async function updateRole(id) {
  await rolesArray();
  inquirer
    .prompt([
      {
        name: "role",
        type: "list",
        message: "Which role do you want to assign:",
        choices: rolesArray,
      },
    ])
    .then(async (answers) => {
      const query = "UPDATE employee SET roles_id=? WHERE id=?";
      db.query(query, [await getRoleId(answers.role), id], (err, data) => {
        if (err) {
          console.log(err);
        } else {
          updateMenu(id);
        }
      });
    });
}

async function updateManager(id) {
  await employeeChoiceArray();
  inquirer
    .prompt([
      {
        name: "manager",
        type: "list",
        message: "Which manager do you want to assign:",
        choices: employeeChoiceArray,
      },
    ])
    .then(async (answers) => {
      const query = "UPDATE employee SET manager_id=? WHERE id=?";
      db.query(query, [await getEmployeeId(answers.manager), id], (err, data) => {
        if (err) {
          console.log(err);
        } else {
          updateMenu(id);
        }
      });
    });
}

async function updateMenu(id) {
  await display(
    `SELECT e.id 'ID', CONCAT_WS(', ', e.last_name, e.first_name) 'Name', roles.title 'Title', department.department 'Department', roles.salary 'Salary', CONCAT_WS(', ', m.last_name, m.first_name) 'Manager' FROM roles, department, employee AS e LEFT JOIN employee AS m ON m.id = e.manager_id WHERE e.roles_id = roles.id AND roles.department_id = department.id AND e.id = ${id};`);
    inquirer
    .prompt([
      {
        name: "choice",
        type: "list",
        message: "What do you want to update:",
        choices: ["Update Role", "Update Manager", "Back"],
      },
    ])
    .then((answers) => {
      switch (answers.choice) {
        case "Update Role":
          updateRole(id);
          break;
        case "Update Manager":
          updateManager(id);
          break;
        default:
          mainMenu();
          break;
      }
    });
}

async function updateEmployee() {
  await employeeChoiceArray();
  inquirer
    .prompt([
      {
        name: "employee",
        type: "list",
        message: "Which employee do you want to update:",
        choices: employeeChoiceArray,
      },
    ])
    .then(async (answers) => {
      updateMenu(await getEmployeeId(answers.employee));    
      });
}

mainMenu();
