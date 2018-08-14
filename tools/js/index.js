jQuery($ => {

    $.getJSON("poc.json", meta =>
        $('#versionning').text("v" + meta.version + " du " + meta.release_date)
    );

    // $('#upload_button').click(() => console.log("click"));
});
