import re


def validate_password(password: str) -> str:
    """
    Validate password requirements:
    - Between 8 and 16 characters
    - At least one uppercase letter
    - At least one number
    - At least one symbol
    """
    if len(password) < 8 or len(password) > 16:
        raise ValueError('Password must be between 8 and 16 characters')
    
    if not re.search(r'[A-Z]', password):
        raise ValueError('Password must contain at least one uppercase letter')
    
    if not re.search(r'[0-9]', password):
        raise ValueError('Password must contain at least one number')
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        raise ValueError('Password must contain at least one symbol (!@#$%^&*(),.?":{}|<>)')
    
    return password


def validate_name(name: str) -> str:
    """
    Validate name (project or scenario) requirements:
    - Between 1 and 20 characters
    """
    if len(name) < 1 or len(name) > 20:
        raise ValueError('Name must be between 1 and 20 characters')
    
    return name


def validate_module_amount(amount: str) -> int:
    """
    Validate module amount requirements:
    - Must be between 1 and 5000
    - Must be an integer
    """
    try:
        amount = int(amount)
        if amount < 1 or amount > 5000:
            raise ValueError('Module amount must be a positive integer between 1 and 5000')
        return amount
    except ValueError as e:
        raise ValueError('Module amount must be a valid integer') from e
    

def validate_tilt(tilt: str) -> float:
    """
    Validate tilt requirements:
    - Must be a float between 0 and 90
    """
    try:
        tilt = float(tilt)
        if tilt < 0 or tilt > 90:
            raise ValueError('Tilt must be a float between 0 and 90')
        return tilt
    except ValueError as e:
        raise ValueError('Tilt must be a valid float') from e
    

def validate_azimuth(azimuth: str) -> float:
    """
    Validate azimuth requirements:
    - Must be a float between -180 and 180 (0 = South, 90 = West, -90 = East)
    """
    try:
        azimuth = float(azimuth)
        if azimuth < -180 or azimuth > 180:
            raise ValueError('Azimuth must be a float between -180 and 180')
        return azimuth
    except ValueError as e:
        raise ValueError('Azimuth must be a valid float') from e
