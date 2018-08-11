var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');
var table = new Table({
    head: ['ID', 'Name', 'Department', 'Price'],
    colWidths: [5, 20, 20, 8]
});

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'edQprs0<;D+l',
    database: 'bamazon'
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("conneced as id " + connection.threadId + "\n Welcome to Bamazon! \n");
    readProducts();
});

function readProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i ++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, "$"+res[i].price]
            );
        }
        console.log(table.toString());

        order();
    });
}

var order = function () {
    inquirer.prompt([{
        name: "id",
        message: "Please enter ID of product you would like to purchase."
    }, {
        name: "number",
        message: "How many would you like?"
    
    }]).then(function(answers) {
        
        connection.query(
            "SELECT price, stock_quantity FROM bamazon.products WHERE ?",
            {item_id: answers.id},
            function(error, res) {
                if (error) throw err;

                var price = res[0].price;
                var stock = res[0].stock_quantity;  

                if (stock < answers.number) {
                    console.log ("Sorry! We do not have sufficient stock to complete your order at this time.");

                    end();

                } else {
                    console.log ("You owe $" + parseInt(price) * parseInt(answers.number) + ".00.");
                    stock = res[0].stock_quantity - answers.number;

                    connection.query(
                        "UPDATE bamazon.products SET ? WHERE ?",
                        [
                          {
                            stock_quantity: stock
                          },
                          {
                            item_id: answers.id
                          }
                        ],
                        function(error) {
                            
                          if (error) throw err;

                          end();

                        }
                      );

                };
                
            });

    })
}

var end = function () {

    inquirer.prompt([{
        type: "list",
        name: "endSession",
        message: "Would you like to select a different item?",
        choices: ["Yes", "No"]
    }]).then(function(answers) {
        if (answers.endSession === "No") {
            console.log("Bye!")
            connection.end();
        } else {
            console.log(table.toString());
            order();
        }
    });

}


