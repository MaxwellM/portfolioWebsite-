var ngModule = angular.module('app');

ngModule.controller('goExampleTranslateCtl', ['$scope', '$http', '$q', '$filter', '$sanitize', function ($scope, $http, $q, $filter, $sanitize) {

    $scope.translate = translate;
    $scope.translation = "";
    $scope.languages = [];
    $scope.lngSelected = "";
    $scope.string = "";

    function translate() {
        // Splitting string
        let SplitString = $scope.string;
        let Lang = getLanguageCode($scope.lngSelected);
        $scope.translation = "";

        $http.get("/api/translate", {params:{SplitString, Lang}}).then(function (res) {
            let results;
            results = res.data;
            $scope.translation = results;

        }, function(error) {
            alert(error.data);
            $scope.translation = "";
        });
    }

    function getLanguageCode(lang) {
        switch (lang) {
            case "Arabic":
                return "ar";
            case "Chinese":
                return "zh";
            case "Esperanto":
                return "eo";
            case "French":
                return "fr";
            case "German":
                return "de";
            case "Latin":
                return "la";
            case "Russian":
                return "ru";
            case "Vietnamese":
                return "vi";
            default:
                return "en";
        }
    }

    function fillLanguages() {
        $scope.languages = [
            "French",
            "Esperanto",
            "Arabic",
            "Chinese",
            "Russian",
            "German",
            "Latin",
            "Vietnamese",
            ];
        $scope.languages.sort();
        $scope.lngSelected = $scope.languages[0];
    }

    fillLanguages();

}]);
