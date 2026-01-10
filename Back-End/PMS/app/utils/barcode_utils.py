"""
QR Code and Barcode Generation Utilities
"""

import qrcode
import barcode
from barcode.writer import ImageWriter
from io import BytesIO
from PIL import Image
from typing import Tuple
from app.utils.logger import logger


def generate_qr_code(data: str, size: int = 300) -> Tuple[BytesIO, str]:
    """
    Generate QR code image.
    
    Args:
        data: Data to encode (usually SKU)
        size: QR code size in pixels (default: 300x300)
    
    Returns:
        Tuple[BytesIO, str]: (Image buffer, filename)
    """
    try:
        # Create QR code instance
        qr = qrcode.QRCode(
            version=1,  # Auto-size
            error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction
            box_size=10,
            border=4
        )
        
        # Add data
        qr.add_data(data)
        qr.make(fit=True)
        
        # Generate image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Resize to desired size
        img = img.resize((size, size), Image.Resampling.LANCZOS)
        
        # Save to buffer
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        # Generate filename
        filename = f"{data}_qr.png"
        
        logger.debug(f"Generated QR code for: {data}")
        return buffer, filename
        
    except Exception as e:
        logger.error(f"Failed to generate QR code: {str(e)}")
        raise Exception(f"QR code generation failed: {str(e)}")


def generate_barcode(data: str, barcode_type: str = 'code128') -> Tuple[BytesIO, str]:
    """
    Generate barcode image.
    
    Args:
        data: Data to encode (usually SKU)
        barcode_type: Barcode type (default: code128)
    
    Returns:
        Tuple[BytesIO, str]: (Image buffer, filename)
    """
    try:
        # Create barcode instance
        barcode_class = barcode.get_barcode_class(barcode_type)
        
        # Generate barcode
        barcode_instance = barcode_class(data, writer=ImageWriter())
        
        # Save to buffer
        buffer = BytesIO()
        barcode_instance.write(
            buffer,
            options={
                'module_width': 0.3,
                'module_height': 10,
                'quiet_zone': 2,
                'font_size': 10,
                'text_distance': 3,
                'background': 'white',
                'foreground': 'black'
            }
        )
        buffer.seek(0)
        
        # Generate filename
        filename = f"{data}_barcode.png"
        
        logger.debug(f"Generated barcode for: {data}")
        return buffer, filename
        
    except Exception as e:
        logger.error(f"Failed to generate barcode: {str(e)}")
        raise Exception(f"Barcode generation failed: {str(e)}")


def cleanup_sku_for_barcode(sku: str) -> str:
    """
    Clean SKU for barcode generation (Code128 compatible).
    
    Args:
        sku: Original SKU
    
    Returns:
        str: Cleaned SKU suitable for barcode
    """
    # Code128 supports ASCII characters, but we'll keep it simple
    # Replace hyphens with underscores or remove them
    cleaned = sku.replace('-', '')
    return cleaned
