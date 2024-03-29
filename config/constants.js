exports.errorMessage = {
    DEFAULT: "Something went wrong",
    NO_EMAIL_OR_PASSWORD: "Please provide both email and password.",
    WRONG_EMAIL_OR_PASSWORD: "Wrong email or password.",
    INSUFFICIENT_USER_INFO: "Please provide all of user information.",
    UPLOAD_FILE_MISSING: "Please attach a file in your request.",
    REQUIRED_FIELDS_MISSING: "REQUIRED_FIELDS_MISSING",
    USER_WITH_SAME_EMAIL_EXISTS: "That email was already taken!",
    INVALID_INFO: "Provide valid info"
};

exports.regExp = {
    URL_REGEX: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
    URL_REGEX2: new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'),
    VALID_CHANNEL_NAME: /^[a-zA-Z0-9_-\s]+$/i,
    VALID_PASSWORD: /^[a-zA-Z0-9!@#$%^&*]{6,}$/i,
    VALID_USER_NAME: /^[a-zA-Z0-9]{3,25}$/i
};

exports.file = {
    UPLOAD_FILE_LOCATION: "public/uploads"
};

exports.BCRYPT_SALT_ROUND = 2;