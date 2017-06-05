
var chartApp = angular.module('chartApp', []);
chartApp.controller('mainCtrl', function($scope, $http) {
	// Variables
	// Testing
	$scope.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	$scope.stockData = [];
	$scope.snapshot = {};
	$scope.input = {symbol: "IBM"};

	$scope.fetchHistoricData = function(symbol,startYear,endYear){
		// Yahoo YQL
		var	urlYQL = "https://query.yahooapis.com/v1/public/yql?format=json&q=",
			urlQuery = encodeURIComponent('select * from csv(2,0) where url = "http://real-chart.finance.yahoo.com/table.csv?s='+symbol+'&a=00&b=01&c='+startYear+'&d=12&e=30&f='+endYear+'&g=m&ignore=.csv" and columns="Date,Open,High,Low,Close,Volume,AdjClose" '),
			endPoint = urlYQL+urlQuery;
			$http.get(endPoint).success(function(data, status, headers, config) {
				// Push result to stockData
				$scope.apiResult = data.query.results.row;
				$scope.stockData.push({
					symbol: symbol,
					monthly: data.query.results.row
				})
				$scope.chartCreate(symbol,'monthly','2015','myChart');
				$scope.tableCreate(symbol,'monthly','5','myChart');
			}).error(function() {
				
			});
	};

	$scope.fetchSnapshot = function(symbol){
		var endPoint = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22"+symbol+"%22)&env=store://datatables.org/alltableswithkeys&format=json";
			$http.get(endPoint).success(function(data, status, headers, config) {
				$scope.snapshot = data.query.results.quote;
				console.log($scope.snapshot); 
			}).error(function() {
				
			});	
	}

	$scope.fetchTopStock = function(){

		// Predefined List
		$http.get('topstock-1.json').success(function(data, status, headers, config) {

			// Get Top 20 Stocks
			var list = [];
			for (a=0;a<20;a++){ 
				list.push(data.list[a].symbol);
			}
			var endPoint = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22"+encodeURIComponent(list.join())+"%22)&env=store://datatables.org/alltableswithkeys&format=json";
			console.log(endPoint);
			$http.get(endPoint).success(function(data, status, headers, config) {
				$scope.topstock = data.query.results.quote;
				console.log($scope.topstock); 
				$scope.chartCreate(symbol,'topmarketcap');
			}).error(function() {
				
			});	

		});
	}

	$scope.tableCreate = function(symbol,type,param,container){
		var priceData = [];
		if (type=="monthly"){

			// Get monthly data
			for (var a=0;a<$scope.stockData.length;a++){
				if ($scope.stockData[a].symbol==symbol){
					for (b=0;b<$scope.stockData[a].monthly.length;b++){
						_data = $scope.stockData[a].monthly[b];
						_data.change = ((_data.Close - _data.Open) * 100 / _data.Open).toFixed(2);
						_data.investment = ((_data.change *.01) * 25000).toFixed(2);
						priceData.push($scope.stockData[a].monthly[b]);			
					}
				}
			}
			
			$scope.monthlytable=priceData;
		}
	}

	$scope.chartCreate = function(symbol,type,param,container){

		// Settings
		var chartConfig;
		var dateList;
		var priceData = [];

		// Monthly Chart 
		if (type=="topmarketcap"){
			// Options
		    chartConfig = {
			labels: [],
		    datasets: [
		        {
		            label: "Top 10",
		            fillColor: "rgba(255,128,0,0.5)",
		            strokeColor: "rgba(255,0,0,0.5)",
		            highlightFill: "rgba(255,128,0,0.7)",
		            highlightStroke: "rgba(255,0,0,0.7)",
		            data: []
		        }]

			}

			// Label and Price
			for (var a=0;a<11;a++){
				chartConfig.labels.push($scope.topstock[a].Symbol);
				chartConfig.datasets[0].data.push(parseFloat($scope.topstock[a].MarketCapitalization));							
			}

			// Generate Chart to container
			// $(".content").append('<div class="monthly">  <div class="title"><span>'+symbol+'</span> <span>Monthly Chart</span> <span>'+param+'</span> </div>  <canvas class="chart"></canvas></div>');

			var ctx = $('.topmarketcap .chart')[0].getContext("2d");
			if ($scope.topmarketcapChart) $scope.topmarketcapChart.destroy();
			$scope.topmarketcapChart = new Chart(ctx).Bar(chartConfig, {
				scaleFontSize: 16,
				scaleFontStyle: "bold",
				bezierCurve : false,
				responsive: true, 
				tooltipTemplate: "$<%= value %> Billion",
				barShowStroke: true
			});

		}

		if (type=='monthly'){

			// Options
		    var index;
		    var chartConfig = {
			labels: [],
		    datasets: [
		        {
		            label: "Monthly Price",
		            fillColor: "rgba(151,187,205,0.10)",
		            strokeColor: "rgba(151,187,205,0.95)",
		            highlightFill: "rgba(151,187,205,0.75)",
		            highlightStroke: "rgba(151,187,205,1)",
		            data: []
		        }]

			}

			// Label and Price
			for (var a=0;a<$scope.stockData.length;a++){
				if ($scope.stockData[a].symbol==symbol){
					index=a;
					for (b=0;b<$scope.stockData[a].monthly.length;b++){
						dates = ($scope.stockData[a].monthly[b].Date).split("-");
						if (dates[0] == param){
							priceData.push($scope.stockData[a].monthly[b]);
						}				
					}
				}
			}
			priceData=priceData.reverse();
			for (var a=0; a<priceData.length; a++){
				// Format Month Label
				dateList=(priceData[a].Date).split("-");
				chartConfig.labels.push( ($scope.months[parseInt(dateList[1])-1]).substring(0,3) );
				// Format Price
				chartConfig.datasets[0].data.push(parseFloat(priceData[a].Close).toFixed(2));
			}


			// Generate Chart to container
			// $(".content").append('<div class="monthly">  <div class="title"><span>'+symbol+'</span> <span>Monthly Chart</span> <span>'+param+'</span> </div>  <canvas class="chart"></canvas></div>');
			$scope.monthlysymbol=symbol;
			$scope.monthlytitle='Monthly Price';
			$scope.monthlyyear=param;
			$scope.monthlycompany=$scope.snapshot.Name;

			var ctx = $('.monthly .chart')[0].getContext("2d");
			if ($scope.myBarChart) $scope.myBarChart.destroy();
			$scope.myBarChart = new Chart(ctx).Line(chartConfig, {
				scaleFontSize: 16,
				scaleFontStyle: "bold",
				bezierCurve : false,
				responsive: true, 
				barShowStroke: true
			});
		}
	}

	$scope.getStockChart = function(symbol){
		$scope.fetchHistoricData(symbol, '2010', '2015'); 
		$scope.fetchSnapshot(symbol);
	}

	$scope.fetchTopStock();
	$scope.fetchHistoricData("TSLA", '2010', '2015'); 
	$scope.fetchSnapshot("TSLA");

});

