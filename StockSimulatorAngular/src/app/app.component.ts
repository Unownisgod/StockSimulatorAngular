import { HttpClient } from '@angular/common/http';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  Chart, registerables
} from 'chart.js';

Chart.register(...registerables)
interface Stock {
  stockValue: number;
  StockDifference: number;
}
interface StockHistory {
  companyName: string;
  stockValues: Stock[];
}
interface Player {
  money: number;
  stock: Array<number>;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  //StoackHisroty contains the previous (10?) stock values for all the companies stock
  public stockHistory: StockHistory[] = [];
  public charts: Array<Chart> = [];
  public player: Player = { money: 5000, stock: [] };
  public companies: number = 10;
  constructor(private title: Title) {
    this.title.setTitle("Stock Simulation")
  }
  ngOnInit() {


    //starts stockhistory with a size of 10 (maybe expand later)
    this.stockHistory = new Array<StockHistory>(this.companies)
    //gets the companes' names
    let companyName = this.generateCompany(this.companies);
    //for each stock fill the values with random values
    for (let i = 0; i < this.companies; i++) {
      this.player.stock.push(0);
      this.stockHistory[i] = { companyName: companyName[i], stockValues: [] }
      let stockInitialValue = Math.floor(Math.random() * (100 - 20 + 1)) + 20;
      this.stockHistory[i].stockValues.push({ stockValue: stockInitialValue, StockDifference: 0 });
    }
    //sets up the charts
    this.setChart()

    //sets the base stocks to work with
    this.getStocks(this.companies)

    //do it again eery 3 seconds
    setInterval(() => this.getStocks(this.companies), 3000);
  }

  async getStocks(arrayLength: number) {

    //for each stock
    for (let i = 0; i < arrayLength; i++) {

      //Generate the difference between last and current stock value
      var difference = parseFloat((Math.random() * (60.0 - (-55.0)) + (-55.0)).toFixed(2));

      //gets the new stick value using (value + (value + differece/100)) and gets 2 decimals
      let stockValue: number = +(this.stockHistory[i].stockValues[0].stockValue + this.stockHistory[i].stockValues[0].stockValue * difference / 100.0).toFixed(2);

      //gets the value to the start of the array
      this.stockHistory[i].stockValues.unshift({ stockValue: stockValue, StockDifference: difference });

      //depreciates anything after the 20th value
      this.stockHistory[i].stockValues = this.stockHistory[i].stockValues.slice(0, 20);
    }

    //update the charts value
    this.updateChart()

  }

  //generates the companies names
  generateCompany(arrayLength: number): string[] {
    let nameList: string[] = [];

    // For each element
    for (let i = 0; i < arrayLength; i++) {
        var characters = "QERTYUIOPASDFGHJKLZXCVBNM"

        var result = "";

        //Gets 3 random letters for the name
        for (let j = 0; j < 3; j++) {
          result += characters.charAt(Math.random() * 25);
        }

        nameList.push(result);
    }
    //returns the list
    return nameList;
  }

  setChart() {
    //initializes a chart array
    var charts: Array<Chart> = []
    //for every chart
    for (var iteration = 0; iteration < this.companies; iteration++) {
      //gets the item on the DOM
      const elem = document.getElementById('acquisitions' + iteration) as HTMLCanvasElement;
      //sets the data values to the stockvalues of the company
      var stockValues: Array<number> = []

      //sets 20 empry labels to show 20 points of data
      const labels = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]

      //sets up the chart config
      const chart = new Chart(
        elem,
        {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: this.stockHistory[iteration].companyName,
              data: stockValues,
              fill: true,
              pointStyle: false,
              borderColor: 'rgb(0, 192, 255)',
              backgroundColor: 'rgb(0,192,255,.1)',
              tension: 0

            }]
          },
          options: {
            scales: {
              x: {
                ticks: {
                  display: false,
                },
              },
              y: {
                beginAtZero: true
              }
            },
          }
        }

      );
      //pushes the chart into the array
      this.charts.push(chart);
    }
  };

  updateChart() {
    //for each chart in the array
    for (var iteration = 0; iteration < this.companies; iteration++) {
      //sets the data values to the stock values of the company
      const stockValues: Array<number> = this.stockHistory[iteration].stockValues.map(item => item.stockValue);

      //reverses the array
      this.charts[iteration].data.datasets[0].data = stockValues.reverse();

      //updates the graphics
      this.charts[iteration].update()
    }
  }

  updatePlayersMoney() {
    //rounds the player's money to 2 decimals
    this.player.money = parseFloat(this.player.money.toFixed(2))

    //updates the dom
    document.getElementById("Money")!.innerHTML = "You have " + this.player.money.toString() + "$";
  }

  buyStock(event: MouseEvent) {
    //searches for the target elements as HTML elements
    const buttonElement = event.target as HTMLElement;

    //gets their ids and processes them
    var splittedId = buttonElement.id.split(" ")
    var stockAmount = parseInt(splittedId[0])
    var stockId = parseInt(splittedId[1])

    //if player has enough money buys stocks
    if (this.player.money > this.stockHistory[stockId].stockValues[0].stockValue * stockAmount) {

      //player pays for the stocks
      this.player.money -= (this.stockHistory[stockId].stockValues[0].stockValue * stockAmount);
      //player gets the stock
      this.player.stock[stockId] += stockAmount;

    }
    this.updatePlayersMoney()
  }

  sellStock(event: MouseEvent) {

    //searches for the target elements as HTML elements
    const buttonElement = event.target as HTMLElement;

    //gets their ids and processes them
    var id = buttonElement.id.split("-")[1];
    var splittedId = id.split(" ");
    var stockAmount = splittedId[0];
    var stockAmountNumber!: number;
    var stockId = parseInt(splittedId[1]);

    //if sell all button pressed sell all they have
    if (stockAmount == "max") {
      stockAmountNumber = this.player.stock[stockId]
    }

    //else set the ammount of stock to sell
    else {
      stockAmountNumber = parseInt(stockAmount)
    }

    //if player has the stocks sell them
    if (stockAmountNumber > this.player.stock[stockId]) {
      stockAmountNumber = this.player.stock[stockId]
    }

    //player gets the money
    this.player.money += this.stockHistory[stockId].stockValues[0].stockValue * stockAmountNumber;

    //player loses the sold stock
    this.player.stock[stockId] -= stockAmountNumber;

    this.updatePlayersMoney()
  }
}
