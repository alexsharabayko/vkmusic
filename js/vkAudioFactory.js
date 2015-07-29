(function () {
    var vkApp = angular.module('vk-app', ['ngSanitize']),
        STEP_COUNT = 20;

    vkApp.factory('vkAudioFactory', function () {
        var vk = {
            appId: 4941221,
            permissions: 'audio'
        };

        VK.init({apiId: vk.appId});

        return {
            login: function () {
                var d = $.Deferred();

                VK._session ? d.resolve() :
                    VK.Auth.login(function (response) {
                        response.session ? d.resolve(response.session) : d.reject();
                    });

                return d;
            },

            getAudio: function (methodName, step, params) {
                var d = $.Deferred(),
                    defParams = { offset: step * STEP_COUNT, count: STEP_COUNT};

                params = params ? $.extend(params, defParams) : defParams;

                this.login().done(function (session) {
                    VK.Api.call(methodName, params, function (data) {
                        typeof data.response[0] === 'number' && data.response.shift();

                        session && (data.response.session = session);

                        data.response ? d.resolve(data.response) : d.reject();
                    });
                });

                return d;
            },

            updateAudio: function (methodName, params) {
                var d = $.Deferred();

                this.login().done(function () {
                    VK.Api.call(methodName, params, function (data) {
                        data.response ? d.resolve(data.response) : d.reject();
                    });
                });

                return d;
            }
        }
    });
})();