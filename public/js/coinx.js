function escapeOutput(toOutput) {
    return toOutput?.replace(/\&/g, '&amp;')
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/\'/g, '&#x27')
        .replace(/\//g, '&#x2F')
}

/**
 * Validates a given string input.
 * The input must be a number with up to one comma and up to one decimal point with up to two decimal places.
 * @param value The value to be validated
 * @return Returns a string of the valid number if it is valid or null if not valid.
 */
const validate = function (value) {
    //var value= $("#field1").val();
    var regex = /^[1-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/
    if (regex.test(value)) {
        //Input is valid, check the number of decimal places
        var twoDecimalPlaces = /\.\d{2}$/g
        var oneDecimalPlace = /\.\d{1}$/g
        var noDecimalPlacesWithDecimal = /\.\d{0}$/g

        if (value.match(twoDecimalPlaces)) {
            //all good, return as is
            return value
        }
        if (value.match(noDecimalPlacesWithDecimal)) {
            //add two decimal places
            return value + '00'
        }
        if (value.match(oneDecimalPlace)) {
            //ad one decimal place
            return value + '0'
        }
        //else there is no decimal places and no decimal
        return value + ".00"
    }
    return null
};

$(function () {
    var socket = io.connect()
    socket.on('create server error', function (error) {
        if (error) {
            showAlert('create-server-errors', error, 'danger', 1000)
        }
    })

    socket.on('server deposit', function (opts) {
        if (opts.useBtc) {
            const kluktOpts = {
                "apikey": opts.apiKey,
                "curr": "USD",
                "email": opts.email,
                "amount": opts.initWager
            }
            console.log(kluktOpts)

            klukt.render('#klukt-widget', kluktOpts, function (payment) {
                console.log('Payment received!!', payment)
            })
        }

        $("#create-server-dialog").fadeOut(function () {
            $("#deposit-coins").fadeIn()
        })
    })

    $('#create-server').on('click', function (evt) {
        const createRoomName = escapeOutput($('#room-name').val())
        if (!createRoomName) {
            showAlert('create-server-errors', 'please enter a server name', 'danger', 1000)
            return
        }

        const createRoomPassword = escapeOutput($('#room-password').val())
        if (!createRoomPassword?.length > 25) {
            showAlert('create-server-errors', 'password cannot exceed 25 characters', 'danger', 1000)
            return
        }
        const createRoomInitWager = escapeOutput($('#init-wager').val())
        if (!validate(createRoomInitWager)) {
            showAlert('create-server-errors', 'invalid initial wager', 'danger', 1000)
            return
        }

        const createRoomMinWager = escapeOutput($('#min-wager').val())
        if (!validate(createRoomMinWager)) {
            showAlert('create-server-errors', 'invalid minimum wager', 'danger', 1000)
            return
        }

        const maxPlayers = escapeOutput($('input[name=maxPlayers]:checked').val())
        if (!maxPlayers || (maxPlayers != 2 && maxPlayers != 5 && maxPlayers != 10)) {
            showAlert('create-server-errors', 'select a maximum amount of players', 'danger', 1000)
            return
        }

        const isChallenger = $('#is-challenger').is(":checked")
        const useBtc = $('#use-btc').is(":checked")

        socket.emit('create new server', {
            roomName: createRoomName,
            password: createRoomPassword,
            initWager: createRoomInitWager,
            minWager: createRoomMinWager,
            maxPlayers: maxPlayers,
            isChallenger: isChallenger,
            useBtc: useBtc
        })
    })

    $('#init-wager').blur(function () {
        const regex = /^[1-9]\d{0,2}(?:,?\d{3})*(?:\.\d{2})?$/
        if (!regex.test($(this).val())) {
            $(this).css("border-color", "#FF0000")
        } else {
            $(this).css("border-color", "rgb(0 164 0)")
        }
    })

    $('#min-wager').blur(function () {
        const regex = /^[1-9]\d{0,2}(?:,?\d{3})*(?:\.\d{2})?$/
        if (!regex.test($(this).val())) {
            $(this).css("border-color", "#FF0000")
        } else {
            $(this).css("border-color", "rgb(0 164 0)")
        }
    })
})