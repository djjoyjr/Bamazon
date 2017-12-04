var mysql = require("mysql");
var inquirer = require("inquirer");
require('console.table');


// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon_DB"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  supervisorMenu();
});

function supervisorMenu() {
  inquirer
    .prompt({
      name: "mainMenu",
      type: "rawlist",
      message: "What activity would you like to do?",
      choices: ["View Product Sales by Department", "Create New Department"]
    })
    .then(function(answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.mainMenu === "View Product Sales by Department") {
        salesReport();
      }
      else if (answer.mainMenu === "Create New Department"){
        createDepartment();
      }
    });
  };


function salesReport() {
  connection.query (
    "SELECT * FROM departments INNER JOIN (SELECT department_name, SUM(product_sales) AS product_sales FROM products GROUP BY department_name) sales ON (departments.department_name = sales.department_name) ORDER BY department_id", function(err, res) {
      if (err) throw err;
      var arr = [];
      var profit = {};
      for (var i = 0; i < res.length; i++) {
        var netSales = (parseInt(res[i].product_sales) - parseInt(res[i].over_head_costs));
        profit=
        {
          department_id:res[i].department_id,
          department_name:res[i].department_name,
          over_head_costs:res[i].over_head_costs,
          product_sales:res[i].product_sales,
          total_profit:netSales
        };
        arr.push(profit);
      }
      console.log("****************************************");
      console.table(arr);
      console.log("****************************************\n");
    supervisorMenu();
  });
};

  function createDepartment() {
    inquirer
      .prompt([
        {
          name: "department_name",
          type: "input",
          message: "What is the name of the new department to create?"
        }
      ])
      .then(function(answer) {
        var query = connection.query(
          "INSERT INTO departments SET ?",
          {
            department_name: answer.department_name,
          },
          function(err, res) {
            console.log("****************************************");
            console.log(res.affectedRows + " deparment created!\n");
            console.log("****************************************\n");
            supervisorMenu();
          }
        );
      });
  }
