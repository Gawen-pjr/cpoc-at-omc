jQuery($ => {

    $.getJSON("poc.json", meta =>
        $('#versionning').text("v" + meta.version + " du " + meta.release_date)
    );
});
