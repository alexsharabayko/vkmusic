(function () {
    var vkApp = angular.module('vk-app');

    vkApp.directive('player', function () {
        var currentAudio = null,
            $currentProgress = null,
            $currentLoading = null,
            $currentTime = null,
            currentVolume = 1;

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
                $currentTime = element.find('.time');
            },

            setCurrentState: function (element) {
                if (!currentAudio.src) {
                    currentAudio.src = currentAudio.dataset.src;
                }

                currentAudio.play();
                $(currentAudio)
                    .on('timeupdate', handlersMethods.updateTime)
                    .on('progress', handlersMethods.updateProgress)
                    .on('ended', { element: element }, handlersMethods.nextSong)

                element.addClass('active').siblings().filter('.active').removeClass('active paused');
            },

            setCurrentVolume: function (element) {
                currentAudio.volume = currentVolume;

                element.find('.volume-value').css('width', (currentVolume * 100) + '%')
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
                helpMethods.setCurrentVolume(element);
                helpMethods.setCurrentState(element);
            },

            pauseClick: function (event) {
                currentAudio.pause();

                event.data.element.addClass('paused');
            },

            updateTime: function () {
                $currentProgress.css('width', (this.currentTime / this.duration * 100) + '%');

                $currentTime.html(globalHelpMethods.toTimeString(this.duration - this.currentTime));
            },

            updateProgress: function () {
                for (var i = 0; i < this.buffered.length; i++) {
                    $currentLoading.css('width', (this.buffered.end(0) / this.duration * 100) + '%');
                }
            },

            progressClick: function (event) {
                var startTime = (event.clientX - this.offsetLeft) / this.offsetWidth * currentAudio.duration;

                currentAudio.currentTime = startTime;
                currentAudio.play();
            },

            volumeClick: function (event) {
                currentVolume = (event.clientX - this.offsetLeft) / this.offsetWidth;

                helpMethods.setCurrentVolume(event.data.element);
            },

            nextSong: function (event) {
                var next = event.data.element.next().length ? event.data.element.next() : event.data.element.siblings().eq(0);
                next.find('.play').trigger('click');
            },

            loopClick: function () {
                currentAudio.loop = !currentAudio.loop;
                $(this).toggleClass('active');
            },

            addRemoveSong: function (event) {
                event.data.element.trigger('add-remove-action');
            }
        };

        return {
            restrict: 'A',

            controller: function ($scope, $element) {
                $element.on('click', '.play', {element: $element}, handlersMethods.playClick);

                $element.on('click', '.pause', {element: $element}, handlersMethods.pauseClick);

                $element.on('click', '.progress', handlersMethods.progressClick);

                $element.on('click', '.volume', {element: $element}, handlersMethods.volumeClick);

                $element.on('click', '.loop', handlersMethods.loopClick);

                $element.on('click', '.remove-song, .add-song', {element: $element}, handlersMethods.addRemoveSong);
            }
        }
    });
})();