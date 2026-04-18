import cv2
from pyzbar.pyzbar import decode
import numpy as np
from typing import Optional


def decode_barcode(image_bytes: bytes) -> Optional[str]:
    """
    Decode barcode/QR code from image bytes.
    Returns the decoded data as string, or None if not found.
    """
    try:
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Decode barcodes
        decoded_objects = decode(img)

        if decoded_objects:
            # Return the first decoded data
            return decoded_objects[0].data.decode("utf-8")

        return None
    except Exception as e:
        print(f"Error decoding barcode: {e}")
        return None
