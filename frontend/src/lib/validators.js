// Mirrors backend/utils/validators.py so the frontend can reject bad input
// before it ever reaches the API. Messages match the backend's wording.

export function validateName(value, label = "Name") {
    const length = (value ?? "").trim().length
    if (length < 1 || length > 20) {
        return { valid: false, message: `${label} must be between 1 and 20 characters` }
    }
    return { valid: true, message: null }
}

export function validateModuleAmount(value) {
    if (value === "" || value === null || value === undefined || !Number.isInteger(Number(value))) {
        return { valid: false, message: "Module amount must be a valid integer" }
    }
    const amount = Number(value)
    if (amount < 1 || amount > 5000) {
        return { valid: false, message: "Module amount must be a positive integer between 1 and 5000" }
    }
    return { valid: true, message: null }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(value) {
    if (!EMAIL_REGEX.test(value ?? "")) {
        return { valid: false, message: "Email must be a valid email address" }
    }
    return { valid: true, message: null }
}

export function validatePassword(value) {
    const password = value ?? ""
    if (password.length < 8 || password.length > 16) {
        return { valid: false, message: "Password must be between 8 and 16 characters" }
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: "Password must contain at least one uppercase letter" }
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: "Password must contain at least one number" }
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one symbol (!@#$%^&*(),.?":{}|<>)' }
    }
    return { valid: true, message: null }
}
