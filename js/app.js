(function () {
    var vkApp = angular.module('vk-app', ['ngSanitize']);

    vkApp.factory('vkAudioFactory', function () {
        var vk = {
            appId: 4941221,
            permissions: 'audio'
        };

        VK.init({apiId: vk.appId});

        return {
            login: function () {
                var d = $.Deferred();

                VK.Auth.login(function (response) {
                    response.session ? d.resolve() : d.reject();
                });

                return d;
            },

            getAudio: function () {
                var d = $.Deferred();

                this.login().done(function () {
                    VK.Api.call('audio.get', {}, function (data) {
                        data.response ? d.resolve(data.response) : d.reject();
                    });
                });

                return d;
            }
        }
    });

    vkApp.directive('vkAudioList', function (vkAudioFactory, $sce) {
        return {
            restrict: 'E',
            templateUrl: 'audioListTmpl.html',
            replace: true,
            scope: {},

            link: function (scope, element) {
                scope.currentAudio = null;
                scope.$currentProgress = null;
                scope.$currentLoading = null;

                vkAudioFactory.getAudio().done(function (songs) {
                    scope.songs = songs.map(function (song) {
                        song.src = $sce.trustAsResourceUrl(song.url.replace(/\?.*/, ''));

                        song.durationMinutes = parseInt(song.duration / 60, 10);
                        song.durationSeconds = song.duration % 60;

                        return song;
                    });
                    scope.$apply();
                });
            }
        }
    });

    vkApp.directive('player', function () {
        var scope;

        var handlersMethods = {
            playClick: function (event) {
                var element = event.data.element,
                    audio = element.find('audio')[0];

                if (audio === scope.currentAudio) {
                    scope.currentAudio.play();
                    element.removeClass('paused');
                    return;
                }

                if (scope.currentAudio && scope.$currentProgress) {
                    scope.currentAudio.pause();
                    scope.currentAudio.currentTime = 0;

                    $(scope.currentAudio).off('timeupdate').off('progress');

                    scope.$currentProgress.removeAttr('style');
                    scope.$currentLoading.removeAttr('style');
                }

                if (!audio.src) {
                    audio.src = audio.dataset.src;
                }

                audio.play();

                scope.currentAudio = audio;
                $(scope.currentAudio).on('timeupdate', event.data, handlersMethods.updateTime).on('progress', event.data, handlersMethods.updateProgress);

                element.addClass('active').siblings().filter('.active').removeClass('active paused');

                scope.$currentProgress = element.find('.progress-value');
                scope.$currentLoading = element.find('.progress-loading');
            },

            pauseClick: function (event) {
                scope.currentAudio.pause();

                event.data.element.addClass('paused');
            },

            updateTime: function (event) {
                scope.$currentProgress.css('width', (this.currentTime / this.duration * 100) + '%');
            },

            updateProgress: function (event) {
                //event.data.scope.$currentLoading.css('width', (this.buffered.end(0) / this.duration * 100) + '%')
            }
        };

        return {
            restrict: 'A',

            link: function (sc) {
                scope = sc;
            },

            controller: function ($scope, $element) {
                $element.on('click', '.play', { element: $element, scope: $scope }, handlersMethods.playClick);

                $element.on('click', '.pause', { element: $element, scope: $scope }, handlersMethods.pauseClick);
            }
        }
    });
})();