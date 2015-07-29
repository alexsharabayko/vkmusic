(function () {
    var vkApp = angular.module('vk-app');

    vkApp.directive('vkAudioList', function (vkAudioFactory, $sce) {
        var step = 0,
            scope = null,
            params = {},
            methodName = 'audio.get';

        var handlersMethods = {
            getAudioByQuery: function (event) {
                var q = event.data.element.find('.search-criteria').val();

                if (methodName === 'audio.search' && !q) {
                    methodName = 'audio.get';
                    step = 0;
                    params = {};
                }

                if (methodName !== 'audio.search' && q) {
                    methodName = 'audio.search';
                    step = 0;
                    params = { q: q, auto_complete: 1, sort: 2 };
                }

                scope.songs = [];
                handlersMethods.getAudio();
            },

            getAudio: function () {
                vkAudioFactory.getAudio(methodName, step, params).done(function (songs) {
                    scope.songs = scope.songs.concat(songs.map(function (song) {
                        song.src = $sce.trustAsResourceUrl(song.url.replace(/\?.*/, ''));

                        song.durationString = globalHelpMethods.toTimeString(song.duration);

                        return song;
                    }));

                    songs.session && (scope.user_id = parseInt(songs.session.user.id));

                    scope.$apply();
                });
            },

            getNextAudio: function () {
                if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
                    step = step + 1;
                    handlersMethods.getAudio();
                }
            },

            addOrRemoveSong: function () {
                var methodName = scope.user_id === parseInt(this.dataset.owner_id) ? 'audio.delete' : 'audio.add';

                vkAudioFactory.updateAudio(methodName, this.dataset).done(function () {

                });
            }
        };

        return {
            restrict: 'E',
            templateUrl: 'audioListTmpl.html',
            replace: true,
            scope: {},

            link: function (sc) {
                scope = sc;

                scope.songs = [];

                handlersMethods.getAudio();
            },

            controller: function ($element, $scope) {
                $element.on('submit', '.search-wrapper', { element: $element, scope: $scope }, handlersMethods.getAudioByQuery);

                $(window).on('scroll', handlersMethods.getNextAudio);

                $element.on('add-remove-action', 'li', handlersMethods.addOrRemoveSong);
            }
        }
    });
})();