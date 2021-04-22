$(function () {
    function toggleRegistration() {
        $("#loginLogo").fadeOut()
        $("#loginForm").fadeOut(function () {
            $("#registerForm").fadeIn()
            $("#registerLogo").fadeIn()
        })
    }
    if (window.location.hash == "#register") {
        toggleRegistration()
    }
    $("#register").click(toggleRegistration)
    setTimeout(function () {
        if ($(".alert-danger").is(":visible")) {
            $(".alert-danger").fadeOut("fast")
        }
    }, 5000)
})