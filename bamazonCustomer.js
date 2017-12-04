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
  afterConnection();
});

function afterConnection() {
  connection.query("SELECT item_id, product_name, price FROM products", function(err, res) {
    if (err) throw err;
    console.log("***********************************************\n");
    console.log("Welcome to Bamazon. Here are the products available for purchase \n");
    console.table(res);
    console.log("***********************************************\n");
    //run the start function after the connection is made to prompt the user
    start();
  });
}

// function which prompts the user for what action they should take
function start() {
  connection.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          message: "Which item_id would you like to buy?",
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
            message: "How many would you like to buy?"
          }
      ])
      .then(function(answer) {
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if(results[i].product_name === answer.choice) {
            chosenItem = results[i];
          }
        }
        // determine if enough are in stock
        if (chosenItem.stock_quantity >= parseInt(answer.units)) {
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: chosenItem.stock_quantity -= answer.units
              },
              {
                item_id: chosenItem.item_id
              }
            ],
            function(error) {
              if (error) throw err;
              console.log("***********************************************\n");
              console.log("Order placed successfully, Thanks for shopping with us!\n");
              console.log("***********************************************\n");
              start();
            }
          )
            connection.query (
              "SELECT price FROM products WHERE ?",
              {
                item_id : chosenItem.item_id
              },
              function(err, res) {
                if (err) throw err;
                // console.log(res[0].price);
                // console.log("answer.units= " +answer.units+ ".");
              var unitCost = parseInt(res[0].price);
              // console.log("unitCost = " +unitCost+ ".");
              var owed = parseInt(answer.units) * unitCost;
              // console.log(owed);
              console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
              console.log("Your total is $" +owed+ ".");
              console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n");
              connection.query(
                "UPDATE products SET ? WHERE ?",
                [
                  {
                    product_sales : chosenItem.product_sales += owed
                  },
                {
                  item_id : chosenItem.item_id
                }
              ]
            );
              }
            );
        }
        else {
          // If there aren't enough in stock, return this message and don't place order.
          console.log("***********************************************\n");
          console.log("Sorry, there aren't enough in stock. Please choose another item or decrease your order size.");
          console.log("***********************************************\n");
          start();
        }
      });
  });
}
