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

var socket
$(function () {
    socket = io.connect()
    socket.on('create server error', function (error) {
        if (error) {
            showAlert('create-server-errors', error, 'danger', 1000)
        }
    })

    socket.on('redirect to server', function (id) {
        window.location.href = '/rooms/' + id
    })

    socket.on('server choose btc deposit', function (opts) {
        $("#create-server-dialog").fadeOut(function () {
            $('#deposit-fee').text(`${opts.btcWager} btc`)
            $("#server-options").hide()
            $("#server-bitcoin-gateway").fadeIn()
        })
    })

    socket.on('server btc deposit', function (opts) {
        $("#server-bitcoin-gateway").fadeOut(function () {
            $('#bitcoin-qrcode').attr('data-bc-address', opts.address)

            $('#btc-address').val(opts.address)

            bitcoinaddress.init({

                // jQuery selector defining bitcon addresses on the page
                // needing the boost
                selector: '.bitcoin-address',

                // Id of the DOM template element we use to decorate the addresses.
                // This must contain placefolder .bitcoin-address
                template: 'bitcoin-address-template',

                qr: {
                    width: 128,
                    height: 128,
                    colorDark: '#000000',
                    colorLight: '#ffffff'
                },

                qrRawAddress: false
            })

            $("#server-bitcoin-deposit").fadeIn()
        })
    })

    socket.on('server btc status', function (status) {
        if (status === 'detected') {
            $('.bitcoin-address-container').hide()
            $("#bitcoin-status").text('detecting payment')
            $("#bitcoin-status-spinner").fadeIn()
            $('#bitcoin-status-message').animate({ 'opacity': 0 }, 1000, function () {
                $(this).text("hold on while we're confirming your payment on the network")
            }).animate({ 'opacity': 1 }, 1000)
        }
        else if (status === 'min-confirmations') {

        }
        else if (status == 'paid') {
            $('.bitcoin-address-container').hide()
            $("#bitcoin-status").text('paid')
            $("#bitcoin-status-spinner").fadeOut()
        }
    })

    $('#native').on('click', function (evt) {
        const transaction = {
            gateway: 'native',
            fee: escapeOutput($('#deposit-fee').text().replace(' btc', ''))
        }

        socket.emit('create server btc deposit', transaction)
    })

    $('#open-node').on('click', function (evt) {
        const transaction = {
            gateway: 'open-node',
            fee: escapeOutput($('#deposit-fee').text().replace(' btc', ''))
        }

        socket.emit('create server btc deposit', transaction)
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
        const btcWager = escapeOutput($('#converted-currency').text().substring(2).replace(' btc', ''))

        console.log('btc amount: ' + btcWager)

        if (useBtc && btcWager == '0') {
            showAlert('create-server-errors', 'bitcoin amount cannot be 0', 'danger', 1000)
            return
        }

        socket.emit('create new server', {
            roomName: createRoomName,
            password: createRoomPassword,
            initWager: createRoomInitWager,
            btcWager: btcWager,
            minWager: createRoomMinWager,
            maxPlayers: maxPlayers,
            isChallenger: isChallenger,
            useBtc: useBtc
        })
    })

    function updateBtcConversion() {
        const wager = escapeOutput($('#init-wager').val())
        if (!validate(wager)) return

        $.get("https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD", function (data) {
            const amount = wager / data["USD"],
                final = amount.toFixed(6)

            $('#converted-currency').text($('<div>').html('&asymp;').text() + ` ${final} btc`)
            $('#currency-conversion').show()
        })
    }

    $('#use-btc').change(function () {
        if (this.checked) {
            updateBtcConversion()
        }
        else $('#currency-conversion').hide()
    })

    $('#init-wager').keyup(function () {
        if ($('#use-btc').is(":checked"))
            updateBtcConversion()
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