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
        var helpMethods = {
            toTimeString: function (duration) {
                var hours = parseInt(duration / 3600) > 0 ? parseInt(duration / 3600) : '',
                    minutes = parseInt(duration / 60) > 9 ? parseInt(duration / 60) : '0' + parseInt(duration / 60),
                    seconds = duration % 60 > 9 ? duration % 60 : '0' + duration % 60;

                return hours ? hours + ' : ' + minutes + ' : ' + seconds : minutes + ' : ' + seconds;
            }
        };

        return {
            restrict: 'E',
            templateUrl: 'audioListTmpl.html',
            replace: true,
            scope: {},

            link: function (scope, element) {
                vkAudioFactory.getAudio().done(function (songs) {
                    scope.songs = songs.map(function (song) {
                        song.src = $sce.trustAsResourceUrl(song.url.replace(/\?.*/, ''));

                        song.durationString = helpMethods.toTimeString(song.duration);

                        return song;
                    });
                    scope.$apply();
                });
            }
        }
    });

    vkApp.directive('player', function () {
        var currentAudio = null,
            $currentProgress = null,
            $currentLoading = null;

        var helpMethods = {
            resetCurrent: function () {
                if (currentAudio && $currentProgress) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;

                    $(currentAudio).off('timeupdate').off('progress');

                    $currentProgress.removeAttr('style');
                    $currentLoading.removeAttr('style');
                }
            },

            setCurrentElements: function (element, audio) {
                currentAudio = audio;
                $currentLoading = element.find('.progress-loading');
                $currentProgress = element.find('.progress-value');
            },

            setCurrentState: function (element) {
                if (!currentAudio.src) {
                    currentAudio.src = currentAudio.dataset.src;
                }

                currentAudio.play();
                $(currentAudio).on('timeupdate', event.data, handlersMethods.updateTime).on('progress', event.data, handlersMethods.updateProgress);

                element.addClass('active').siblings().filter('.active').removeClass('active paused');
            }
        };

        var handlersMethods = {
            playClick: function (event) {
                var element = event.data.element,
                    audio = element.find('audio')[0];

                if (audio === currentAudio) {
                    currentAudio.play();
                    element.removeClass('paused');
                    return;
                }

                helpMethods.resetCurrent();
                helpMethods.setCurrentElements(element, audio);
                helpMethods.setCurrentState(element);
            },

            pauseClick: function (event) {
                currentAudio.pause();

                event.data.element.addClass('paused');
            },

            updateTime: function () {
                $currentProgress.css('width', (this.currentTime / this.duration * 100) + '%');
            },

            updateProgress: function () {
                for (var i = 0; i < this.buffered.length; i++) {
                    $currentLoading.css('width', (this.buffered.end(0) / this.duration * 100) + '%');
                }
            }
        };

        return {
            restrict: 'A',

            controller: function ($scope, $element) {
                $element.on('click', '.play', { element: $element }, handlersMethods.playClick);

                $element.on('click', '.pause', { element: $element }, handlersMethods.pauseClick);
            }
        }
    });
})();