function isNumberKey(txt, evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode == 44) return true
    if (charCode == 46) {
        //Check if the text already contains the . character
        if (txt.value.indexOf('.') === -1) {
            return true
        } else {
            return false
        }
    } else {
        if (charCode > 31 &&
            (charCode < 48 || charCode > 57))
            return false
    }
    return true
}

function showAlert(container, message, type, closeDelay) {
    var $cont = $("#" + container);

    if ($cont.length == 0) {
        // alerts-container does not exist, create it
        $cont = $(`<div id="${container}">`)
            .css({
                position: "fixed"
                , width: "50%"
                , left: "25%"
                , top: "10%"
            })
            .appendTo($("body"));
    }

    // default to alert-info; other options include success, warning, danger
    type = type || "info";

    // create the alert div
    var alert = $('<div>')
        .addClass("fade in show alert alert-" + type)
        /*.append(
            $('<button type="button" class="close" data-dismiss="alert">')
                .append("&times;")
        )*/
        .append(message);

    // add the alert div to top of alerts-container, use append() to add to bottom
    $cont.prepend(alert);

    // if closeDelay was passed - set a timeout to close the alert
    if (closeDelay)
        window.setTimeout(function () { alert.alert("close") }, closeDelay);
}

$(function () { })