var ngModule = angular.module('app');

ngModule.controller('angularJSExampleChartCtrl', ['$scope', '$http', '$q', '$filter', '$interval', function ($scope, $http, $q, $filter, $interval) {

    $scope.readVisitors = readVisitors;
    $scope.selectIPLocation = selectIPLocation;
    $scope.getIPLocations = null;

    $scope.promise = null;

    $scope.visitors = [];
    $scope.monthlyVisitors = [];
    $scope.currentMonthTotal = undefined;
    $scope.currentPageMonthTotal = undefined;
    $scope.currentMonthName = "";
    $scope.chartData = [];
    $scope.currentMonth = "";
    $scope.ipLocationList = [];
    $scope.selectedIP = [];

    $scope.pingTime = 0.0;
    $scope.distance = 0.0;
    $scope.browserCity = "";
    $scope.browserState = "";

    $scope.myPage = 1;
    $scope.myLimit = 10;

    $scope.query = {
        order: '-timestamp',
        limit: 10,
        page: 1
    };

    function ping() {
        let start = performance.now();
        $http.get("/api/ping").then(function (res) {
            let finish = performance.now();
            $scope.pingTime = Math.round(finish - start);
        }, function(error) {
            console.log(error.data);
        });
    }

    function readIP() {
        $http.get("/api/readIP").then(function (res) {
            let results = res.data;
            $scope.distance = calculateDistance(results.latitude, 32.779167 , results.longitude, -96.808891);
            $scope.browserCity = results.city;
            $scope.browserState = results.region_code;
        }, function (error) {
            console.log(error);
        })
    }

    // Found this here:
    // https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
    function calculateDistance(lat1, lat2, long1, long2) {
        const p = 0.017453292519943295;    // Math.PI / 180
        const c = Math.cos;
        const a = 0.5 - c((lat2 - lat1) * p) / 2 +
            c(lat1 * p) * c(lat2 * p) *
            (1 - c((long2 - long1) * p)) / 2;


        let kmDistance = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
        // Convert to miles
        let miDistance = kmDistance / 1.609344;
        return miDistance;
    }

    function drawChart(data) {
        let chart;

        chart = c3.generate({
            bindto: 'div#chart',
            size: {
                height: 400
            },
            padding: {
                top: 20,
                right: 50,
                bottom: 20,
                left: 50,
            },
            data: {
                json: $scope.monthlyVisitors,
                mimeType: 'json',
                x: 'X',
                xFormat: '%Y-%m-%dT%H:%M:%SZ',
                keys: {
                    x: 'date_stamp', // it's possible to specify 'x' when category axis
                    value: ['count', 'pageCount', 'avgCount', 'avgPageCount'],
                },
                names: {
                    count: 'Unique Visitors',
                    pageCount: 'Page Views',
                    avgCount: '3 Month Rolling AVG Unique Visitors',
                    avgPageCount: '3 Month Rolling AVG Page Views'
                },
                colors: {
                    count: '#ff0000',
                    pageCount: '#0000ff',
                    avgCount: '#ff0000',
                    avgPageCount: '#0000ff'
                },
            },
            axis: {
                y: {
                    label: {
                        text: 'Value',
                        position: 'inner-center'
                    },
                },
                x: {
                    type: 'timeseries',
                    tick: {
                        rotate: 75,
                        multiline: false,
                        culling: false,
                        format: '%Y-%m'
                    },
                    label: {
                        text: 'Time',
                        position: 'inner-center'
                    },
                },
            },
        });
    }

    function getMonthName() {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const d = new Date();
        return monthNames[d.getMonth()];
    }

    function readVisitors() {
        $http.get("/api/readVisitors").then(function (res) {
            let results;
            results = res.data;
            $scope.visitors = results;
        }, function (err) {
            alert("ERROR, /readVisitors: ", err);
        })
    }

    function readMonthlyVisitors() {
        $http.get("/api/readMonthlyVisitors").then(function (res) {
            let results;
            let currentMonth = getMonthName();
            results = res.data;
            $scope.monthlyVisitors = round(results);
            $scope.currentMonthName = currentMonth;

            // Setting the total for this month!
            for (const[index,item] of $scope.monthlyVisitors.entries()) {
                if (item.month === currentMonth) {
                    $scope.currentMonthTotal = item.count;
                    $scope.currentPageMonthTotal = item.pageCount;
                }
            }

            //$scope.currentMonthTotal = 0;
            // sort our results by month
            results.sort(function(a,b) {return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);} );
            drawChart(results);
        }, function (err) {
            alert("ERROR /api/readMonthlyVisitors: ", err);
        })
    }

    // Will take a json array of objects and loop through it and
    // if it is a number, convert it to two decimal places.
    function round(jsonData) {
        jsonData.forEach((element) => {
            for (var key of Object.keys(element)) {
                if (typeof element[key] === "number") {
                    element[key] = element[key].toFixed(2);
                }
            }
        });

        return jsonData;
    }

    function setCurrentMonth() {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const d = new Date();
        $scope.currentMonth = monthNames[d.getMonth()];
    }

    $scope.getIPLocations = function() {
        //let ip;
        $http.get("/api/getIPLocation").then(function (res) {
            let results;
            results = res.data;
            $scope.ipLocationList = results;
        }, function (err) {
            alert("Error obtaining the location for that IP: ", err);
        });
    }

    function selectIPLocation(ip) {
        $scope.selectedIP = $scope.ipLocationList.filter(function (ipNumber) {
            return ipNumber.ip === ip;
        });
    }

    // starts the interval
    $scope.start = function() {
        // stops any running interval to avoid two intervals running at the same time
        $scope.stop();

        // store the interval promise
        $scope.promise = $interval(ping, 2500);
    };

    // stops the interval
    $scope.stop = function() {
        $interval.cancel($scope.promise);
    };

    // If this gets destroyed (when leaving the tab) we'll stop the pinging!
    $scope.$on('$destroy', function() {
        console.log("cancelling interval");
        $interval.cancel($scope.promise);
    });

    setCurrentMonth();
    readVisitors();
    readMonthlyVisitors();

    readIP();

    $scope.getIPLocations();

    ping();

    $scope.start();
}]);
