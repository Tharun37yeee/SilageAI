import os
import sys

# Ensure the project root directory is on the Python path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.app import app

# Expose both app and handler for Vercel Serverless Function compatibility
handler = app

__all__ = ["app", "handler"]
