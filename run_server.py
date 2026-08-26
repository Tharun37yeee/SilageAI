import uvicorn
import os
import sys

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting SilageIQ web server at http://localhost:{port}")
    uvicorn.run("backend.app:app", host="0.0.0.0", port=port, reload=True)
