var app = angular.module('mirro', ['ngRoute', 'ngAnimate', 'ngSanitize', 'slickCarousel']);

app.config(['$compileProvider', "$routeProvider", "$interpolateProvider", "$locationProvider",

    function($compileProvider, $routeProvider, $interpolateProvider, $locationProvider) {
        $interpolateProvider.startSymbol('{[{');
        $interpolateProvider.endSymbol('}]}');
        $locationProvider.hashPrefix('');
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|viber|tel|mailto|chrome-extension):/);
        $routeProvider
            .when('/main', {
                templateUrl: 'main.html'
            })
            .when('/mirror', {
                templateUrl: 'mirror.html'
            })
            .when('/delivery', {
                templateUrl: 'delivery.html'
            })
            .when('/checkout', {
                templateUrl: 'checkout.html'
            })
            .otherwise({
                redirectTo: '/main'
            });
    }
]);

app.controller('mirroCtrl', function($scope, $http, $route, $routeParams, $location, $timeout) {

    var urlQuery = $location.search();

    $scope.lng = {};
    $scope.selectedStyle = urlQuery.style ? urlQuery.style : "";
    $scope.selectedColor = urlQuery.color ? urlQuery.color : "";
    $scope.emptyCart = !0;
    $scope.cartQuant = 0;
    $scope.availClass = "green-bg";
    $scope.frameCodes = "MIRRO: ";
    if (navigator.language == "uk" || navigator.language == "ua") {
        $scope.setLang = "en";
    } else {
        $scope.setLang = "ua";
    }

    $scope.$on('$viewContentLoaded', function(event) {
        $scope.mainView = ($route.current.templateUrl !== 'main.html') ? false : true;
        $scope.checkoutView = ($route.current.templateUrl !== 'checkout.html') ? false : true;

        if ($route.current.templateUrl == 'mirror.html') {
            $location.search( "mirror", $scope.selectedMirror.id );
        }

    });

    $scope.changeLang = function() {

        if ($scope.setLang == "en") {
            for (let key in $scope.langData) {
                $scope.lng[key] = $scope.langData[key].en;
            }
            $scope.allProducts.forEach(function(obj) {
                obj.title = obj.titleEN;
            });
            $scope.langData.colors.forEach(function(obj) {
                obj.name = obj.nameEN;
            });
            $scope.setLang = "ua";

        } else {
            for (let key in $scope.langData) {
                $scope.lng[key] = $scope.langData[key].ua;
            }
            $scope.allProducts.forEach(function(obj) {
                obj.title = obj.titleUA;

            });
            $scope.langData.colors.forEach(function(obj) {
                obj.name = obj.nameUA;
            });
            $scope.setLang = "en";
        }
    }

    // console.log($scope.selectedMirror.id);

    $http.get("assets/data/data.json").then(function(response) {
        $scope.data = response.data.common;
        $scope.langData = response.data.lang;
        $scope.currCurr = $scope.data.currencies[0];

        $http.get("assets/data/products.json").then(function(response) {
            $scope.allProducts = response.data;
            $scope.changeLang();
            if (urlQuery.mirror) {
                for (var i = $scope.allProducts.length - 1; i >= 0; i--) {
                    if (urlQuery.mirror == $scope.allProducts[i].id) {
                        $scope.selectMirror(i);
                        break;
                    }
                }
            } else {
                $scope.selectMirror(0);
            }

        });


        /* $scope.mainSlickConfig = {
             arrows: false,
             autoplay: true,
             pauseOnHover: false,
             autoplaySpeed: 2400,
             speed: 1200,
             fade: true
         };
         $scope.objSlickConfig = {
             centerMode: true,
             variableWidth: true,
             arrows: false,
             autoplay: true,
             pauseOnHover: false,
             speed: 800,
             autoplaySpeed: 2400
         };

         $scope.slickLoaded = true;
         $scope.gallerySlickConfig = {
               dots: true,
             responsive: [{
                 breakpoint: 1200,
                 settings: {
                     arrows: false
                 }
             }],
             event: {
                 init: function(event, slick) {
                     slick.slickGoTo($scope.selectedImg); // slide to correct index when init
                 }
             }
         }*/
    });

    $scope.selectStyle = function(index) {
        $scope.selectedStyle = $scope.data.styles[index].id;
        $scope.menuCatSel = index;
        $location.search("style", $scope.selectedStyle );

    }
    $scope.selectColor = function(index, id) {
        $scope.selectedColor = id;
        $scope.menuColorSel = index;
        $location.search("color", $scope.selectedColor);

    }

    $scope.mirrorCart = [];

    $scope.addToCart = function(mirror) {
        if (!$scope.mirrorCart.some(x => x.id == mirror.id)) {

            $scope.mirrorCart.push(mirror);
            $scope.cartQuant = $scope.mirrorCart.length;
            $scope.emptyCart = !$scope.mirrorCart;
        }
    }

    $scope.deleteFromCart = function(index) {
        $scope.mirrorCart.splice(index, 1);
        $scope.countSum();
        $scope.cartQuant = $scope.mirrorCart.length;
        $scope.emptyCart = !$scope.mirrorCart.length;

    }
    $scope.countSum = function() {
        $scope.totalSum = 0;
        $scope.mirrorCart.forEach(function(i) {
            $scope.totalSum += Number(i.price);
            $scope.frameCodes += i.id + ", ";
        });
    }


    $scope.sort = function(keyname) {
        $scope.sortKey = keyname; //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    };


    $scope.selectMirror = function(index) {
        $scope.selMrrIndx = index;
        $scope.selectedMirror = $scope.allProducts[index];
        $location.search( "mirror", $scope.selectedMirror.id );
        $scope.setPrevNextMirrors(index);
        $scope.selectedMirror.avail == "sold" ?
            ($scope.availClass = "copper-bg", $scope.selectedMirror.availView = $scope.lng.soldOut) :
            $scope.selectedMirror.avail == "on demand" ?
            ($scope.availClass = "gold-bg", $scope.selectedMirror.availView = $scope.lng.onDmnd) :
            ($scope.availClass = "green-bg", $scope.selectedMirror.availView = $scope.lng.inStock)

        $scope.selectVariant(0);
    }

    $scope.selectVariant = function(index) {
        $scope.selectedVariant = index + 1;
    }

    $scope.setPrevNextMirrors = function(index) {
        let i = index;
        const cat = $scope.allProducts;
        // const mirror = $scope.selMrrIndx;

        $scope.prevMirrorName = (i !== 0) ?
            cat[i - 1].id : cat[cat.length - 1].id;
        $scope.nextMirrorName = (i < cat.length - 1) ?
            cat[i + 1].id : cat[0].id;

    }

    $scope.prevMirror = function() {
        var i = $scope.selMrrIndx;
        var newIndx = (i !== 0) ? --i : $scope.allProducts.length - 1;
        $scope.selectMirror(newIndx);
        $scope.setPrevNextMirrors(newIndx);
    }

    $scope.nextMirror = function() {
        var i = $scope.selMrrIndx;
        var newIndx = (i < $scope.allProducts.length - 1) ? ++i : 0;
        $scope.selectMirror(newIndx);
        $scope.setPrevNextMirrors(newIndx);
    }

    $scope.key = function($event) {
        if ($event.keyCode == 37) { // left arrow
            $scope.prevMirror();

        } else if ($event.keyCode == 39) { // right arrow
            $scope.nextMirror();
        }
    }

    // FORM-SUBMISSION-HANDLER

    // get all data in form and return object
    function getFormData() {
        var elements = document.getElementById("gform").elements; // all form elements
        var fields = Object.keys(elements).map(function(k) {
            if (elements[k].name !== undefined) {
                return elements[k].name;
                // special case for Edge's html collection
            } else if (elements[k].length > 0) {
                return elements[k].item(0).name;
            }
        }).filter(function(item, pos, self) {
            return self.indexOf(item) == pos && item;
        });
        var data = {};
        fields.forEach(function(k) {
            data[k] = elements[k].value;
            if (elements[k].type === "checkbox") {
                data[k] = elements[k].checked;
                // special case for Edge's html collection
            } else if (elements[k].length) {
                for (var i = 0; i < elements[k].length; i++) {
                    if (elements[k].item(i).checked) {
                        data[k] = elements[k].item(i).value;
                    }
                }
            }
        });
        console.log(data);
        return data;
    }

    $scope.formSubmit = function() { // handles form submit withtout any jquery
        // event.preventDefault(); // we are submitting via xhr below
        var data = getFormData(); // get the values submitted in the form

        // var url = event.target.action; //
        var url = "https://script.google.com/macros/s/AKfycby1MXFzklbdY3b_6nPIGOpJaTaNdr8iOY4bEH8jpyYMID-O1DJJzTeN-Kn3nVG7vBwx7w/exec"; //
        // var url = "https://script.google.com/macros/s/AKfycbzTk1MXcnDWmccVSjUGPJBzp_7SpaRey36ebKNFRg/exec"; //
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        // xhr.withCredentials = true;
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function() {
            console.log(xhr.status, xhr.statusText)
            console.log(xhr.responseText);
            // document.getElementById('gform').style.display = 'none'; // hide form
            document.getElementById('thankyou_message').style.display = 'block';
            return;
        };
        // url encode form data for sending as post data
        var encoded = Object.keys(data).map(function(k) {
            return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
        }).join('&')
        xhr.send(encoded);
        // }
    }
    // END of FORM-SUBMISSION-HANDLER
});

app.directive('angularMask', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            isModelValueEqualViewValues: '='
        },
        link: function($scope, el, attrs, model) {
            $scope.$watch(function() { return attrs.angularMask; }, function(value) {
                if (model.$viewValue != null) {
                    model.$viewValue = mask(String(model.$viewValue).replace(/\D/g, ''));
                    el.val(model.$viewValue);
                }
            });

            model.$formatters.push(function(value) {
                return value === null ? '' : mask(String(value).replace(/\D/g, ''));
            });

            model.$parsers.push(function(value) {
                model.$viewValue = mask(value);
                var modelValue = $scope.isModelValueEqualViewValues ? model.$viewValue : String(value).replace(/\D/g, '');
                el.val(model.$viewValue);
                return modelValue;
            });

            function mask(val) {
                var format = attrs.angularMask,
                    arrFormat = format.split('|');

                if (arrFormat.length > 1) {
                    arrFormat.sort(function(a, b) {
                        return a.length - b.length;
                    });
                }

                if (val === null || val == '') {
                    return '';
                }
                var value = String(val).replace(/\D/g, '');
                if (arrFormat.length > 1) {
                    for (var a in arrFormat) {
                        if (value.replace(/\D/g, '').length <= arrFormat[a].replace(/\D/g, '').length) {
                            format = arrFormat[a];
                            break;
                        }
                    }
                }
                var newValue = '';
                for (var nmI = 0, mI = 0; mI < format.length;) {
                    if (!value[nmI]) {
                        break;
                    }
                    if (format[mI].match(/\D/)) {
                        newValue += format[mI];
                    } else {
                        newValue += value[nmI];
                        nmI++;
                    }
                    mI++;
                }
                return newValue;
            }
        }
    };
});