var globalHelpMethods = {
    toTimeString: function (duration) {
        var hours = parseInt(duration / 3600) > 0 ? parseInt(duration / 3600) : '',
            minutes = parseInt(duration / 60) > 9 ? parseInt(duration / 60) : '0' + parseInt(duration / 60),
            seconds = parseInt(duration % 60) > 9 ? parseInt(duration % 60) : '0' + parseInt(duration % 60);

        return hours ? hours + ' : ' + minutes + ' : ' + seconds : minutes + ' : ' + seconds;
    }
};