import hashlib

def hash_password(password: str) -> str:
    """
    Hashes a password string using SHA-256 for simple and portable storage
    without native compilation overhead.
    """
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies that a plain text password hashes to the saved password hash.
    """
    return hash_password(plain_password) == hashed_password
