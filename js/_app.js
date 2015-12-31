
// select * from csv(2,0) where url = 'http://real-chart.finance.yahoo.com/table.csv?s=GOOG&a=02&b=27&c=2015&d=11&e=10&f=2015&g=m&ignore=.csv' and columns="Date,Open,High,Low,Close,Volume,AdjClose"

var chartApp = angular.module('chartApp', []);
chartApp.controller('mainCtrl', function($scope, $http) {

	$scope.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	$scope.stockData = [];


	$scope.fetchEndpoint = function(symbol,startYear,endYear){
		// Yahoo YQL
		var	urlYQL = "https://query.yahooapis.com/v1/public/yql?format=json&q=",
			urlQuery = encodeURIComponent('select * from csv(2,0) where url = "http://real-chart.finance.yahoo.com/table.csv?s='+symbol+'&a=00&b=01&c='+startYear+'&d=12&e=30&f='+endYear+'&g=m&ignore=.csv" and columns="Date,Open,High,Low,Close,Volume,AdjClose" '),
			endPoint = urlYQL+urlQuery;
			console.log(decodeURIComponent(urlQuery));

			$http.get(endPoint).success(function(data, status, headers, config) {
				// Push to primary stock dataset
				$scope.apiResult = data.query.results.row;
				$scope.stockData.push({
					symbol: symbol,
					monthly: data.query.results.row
				})


				// Generate Chart
				// $scope.chartGenerateMonthly(symbol,"myChart","monthly","2015"); 
				$scope.chartGenerateYearly(symbol,"myChart","yearly","00");

			}).error(function() {
				
			});
	};

	$scope.getData = function (symbol,type,param){
		var date = new Date();
		var year = date.getFullYear();
		var content = [];
		var dates = [];
		var yearIndex = 0;

		if (type=='monthly'){
			for (a=0;a<$scope.stockData.length;a++){
				if ($scope.stockData[a].symbol==symbol){
					for (b=0;b<$scope.stockData[a].monthly.length;b++){
						// Check for year **
						dates = ($scope.stockData[a].monthly[b].Date).split("-");
						if (dates[0] == param){
							content.push($scope.stockData[a].monthly[b]);
						}				
					}
				}
			}
			return content.reverse();
		}

		if (type=='yearly'){
			for (x=0;x<5;x++){
				content.push({year: (year-x)});
			}
			for (a=0;a<$scope.stockData.length;a++){
				if ($scope.stockData[a].symbol==symbol){
					for (b=0;b<$scope.stockData[a].monthly.length;b++){
						dates = ($scope.stockData[a].monthly[b].Date).split("-");

						if (dates[1] == "01" || dates[1] == "12"){
							for (x=0;x<content.length;x++){
								if (dates[0]==content[x].year){
									yearIndex=x;
								}
							}
						}

						if (dates[1] == "01"){
							content[yearIndex].open = $scope.stockData[a].monthly[b].Open;
						} else if (dates[1] == "12"){
							content[yearIndex].close = $scope.stockData[a].monthly[b].Close; 			
						}	
					}
				}
			}
			return content;
		}
	}

	$scope.getYearIndex = function(content,year){
		for (a=0;a<content.length-1;a++){
			if (content[a].year==year) { 
				console.log(a,content[a].year,year);
				// return a;
			}
		}
	}

	$scope.chartGenerateYearly = function(symbol,container,type,param){

		// Chart Configuration 
		var chartConfig = {
			labels: [],
		    datasets: [
		        {
		            label: "My First dataset",
		            fillColor: "rgba(151,187,205,0.5)",
		            strokeColor: "rgba(151,187,205,0.8)",
		            highlightFill: "rgba(151,187,205,0.75)",
		            highlightStroke: "rgba(151,187,205,1)",
		            data: []
		        }]		
		}

		// Search list for symbol and parase data
		var stockData = $scope.getData(symbol,type,param);
		stockData = stockData.reverse();
		// Push data and format label
		for (a=0;a<stockData.length; a++){
			if (parseInt(stockData[a].close)){
				chartConfig.labels.push(stockData[a].year);
				chartConfig.datasets[0].data.push(parseInt(stockData[a].close));
				console.log(stockData[a].close);
			}
		}

		console.log(chartConfig); 

		// Generate Chart to container
		var ctx = $('.chartClass')[0].getContext("2d");
		if ($scope.myBarChart) $scope.myBarChart.destroy();
		$scope.myBarChart = new Chart(ctx).Bar(chartConfig, {
			responsive: true, 
			barShowStroke: true
		});
	}

	$scope.chartGenerateMonthly = function(symbol,container,type,param){
		// Chart Configuration
		var chartConfig = {
			labels: [],
		    datasets: [
		        {
		            label: "My First dataset",
		            fillColor: "rgba(220,220,220,0.2)",
		            strokeColor: "rgba(220,220,220,1)",
		            pointColor: "rgba(220,220,220,1)",
		            pointStrokeColor: "#fff",
		            pointHighlightFill: "#fff",
		            pointHighlightStroke: "rgba(220,220,220,1)",
		            data: []
		        }]		
		}
		// Search list for symbol and parase data
		var stockData = $scope.getData(symbol,type,param);
		// Push data to config and format label
		for (var a=0; a<stockData.length; a++){
			chartConfig.labels.push($scope.formatLabel(stockData[a].Date));
			chartConfig.datasets[0].data.push(stockData[a].Close);
		}
		// Generate Chart to container
		// var ctx = document.getElementById(container).getContext("2d");
		var ctx = $('.chartClass')[0].getContext("2d");

		$scope.myBarChart = new Chart(ctx).Line(chartConfig, {
			responsive: true, 
			bezierCurve: false,
            tooltipTemplate: "Price: <%= value %>"
		});
	}

	$scope.formatLabel = function(date){
		var dates = date.split('-');
		return $scope.months[parseInt(dates[1])-1]; 
	}

	$scope.clickStock = function(){
		$scope.fetchEndpoint($("#symbol").val(), '2012', '2015'); 
	}

});




// Custom filter directives
/*searchApp
	.filter('replace', function(){
	  return function(input, find, replace) {
	  	if (input){
	  		return input.replace(find, ''); 
	  	}
	  };
	})
	.filter('strlen', function() {
	  return function(input, limit) {
	  	if (input){
		    out = input.substring(0,limit);
		    return out;
		}
	  };
	});
*/


// myBarChart.datasets[0].bars[2].value = 600;
// myBarChart.update();
