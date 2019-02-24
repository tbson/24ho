function FormDataMock(input) {
    return input;
}

module.exports = window.FormData = FormDataMock;
