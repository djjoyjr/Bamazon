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
  managerMenu();
});

function managerMenu() {
  inquirer
    .prompt({
      name: "mainMenu",
      type: "rawlist",
      message: "What activity would you like to do?",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
    })
    .then(function(answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.mainMenu === "View Products for Sale") {
        productsForSale();
      }
      else if (answer.mainMenu === "View Low Inventory"){
        lowInventory();
      }
      else if (answer.mainMenu === "Add to Inventory"){
        restock();
    }
      else if (answer.mainMenu === "Add New Product"){
        createProduct();
      }
    });
  };

  function lowInventory() {
    connection.query (
      "SELECT product_name FROM products WHERE stock_quantity <5", function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
          console.log("****************************************");
          console.log("Time to reorder: " +res[i].product_name);
          console.log("****************************************\n");
        }
      managerMenu();
    });
  }

function restock() {
  connection.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;
  inquirer
    .prompt([
      {
        name: "choice",
        type: "rawlist",
        message: "Which product would you like to restock?",
        choices: function() {
          var choiceArray = [];
          for (var i = 0; i < results.length; i++) {
            choiceArray.push(results[i].product_name);
          }
          return choiceArray;
        },
      },
        {
          name: "units",
          type: "input",
          message: "How many would you like to order?"
        }
    ])
    .then(function(answer) {
      var chosenItem;
      for (var i = 0; i < results.length; i++) {
        if(results[i].product_name === answer.choice) {
          chosenItem = results[i];
        }
      }
    connection.query(
      "UPDATE products SET ? WHERE ?",
      [
        {
          stock_quantity: chosenItem.stock_quantity += parseInt(answer.units)
        },
        {
          product_name: chosenItem.product_name
        }
      ],
      function(error) {
        if (error) throw err;
        console.log("\n****************************************");
        console.log("Restocking successful!");
        console.log("****************************************\n");
        managerMenu();
      }
    );
    })
  });
};

  function productsForSale() {
    connection.query("SELECT item_id, product_name, price,stock_quantity FROM products", function(err, res) {
      if (err) throw err;
      console.table(res);
      managerMenu();
    });
  }

  function createProduct() {
    inquirer
      .prompt([
        {
          name: "product_name",
          type: "input",
          message: "What is the name of the new product to add?"
        },
        {
          name: "department_name",
          type: "input",
          message: "What department does this item belong in?"
        },
        {
          name: "price",
          type: "input",
          message: "What is the per/unit cost of this item?"
        },
        {
          name: "stock_quantity",
          type: "input",
          message: "How many do you want to stock?"
        }
      ])
      .then(function(answers) {
        var query = connection.query(
          "INSERT INTO products SET ?",
          {
            product_name: answers.product_name,
            department_name: answers.department_name,
            price: answers.price,
            stock_quantity: answers.stock_quantity
          },
          function(err, res) {
            console.log("****************************************");
            console.log(res.affectedRows + " product inserted!\n");
            console.log("****************************************\n");
            managerMenu();
          }
        );
      });
  }
