import multiprocessing
import os
import sys

# Required on Windows to prevent infinite process spawning
multiprocessing.freeze_support()

# When running as a PyInstaller bundle, store the DB next to the EXE (not in temp dir)
if getattr(sys, "frozen", False):
    exe_dir = os.path.dirname(sys.executable)
else:
    exe_dir = os.path.dirname(os.path.abspath(__file__))

db_path = os.path.join(exe_dir, "inventory.db")
os.environ.setdefault("DATABASE_URL", f"sqlite:///{db_path}")

if __name__ == "__main__":
    import uvicorn
    from app.main import app

    uvicorn.run(app, host="0.0.0.0", port=8000)
