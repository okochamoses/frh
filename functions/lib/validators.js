const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email) => {
    if (!email || typeof email !== "string" || !email.trim()) {
        return {valid: false, error: "Email is required"};
    }

    if (!EMAIL_REGEX.test(email)) {
        return {valid: false, error: "Invalid email format"};
    }

    return {valid: true};
};

module.exports = {validateEmail};
