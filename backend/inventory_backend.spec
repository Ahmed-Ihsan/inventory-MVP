# -*- mode: python ; coding: utf-8 -*-
import os

block_cipher = None

a = Analysis(
    ['run_exe.py'],
    pathex=['.'],
    binaries=[
        # pyzbar DLLs (required for barcode scanning)
        ('venv/lib/site-packages/pyzbar/libiconv.dll', 'pyzbar'),
        ('venv/lib/site-packages/pyzbar/libzbar-64.dll', 'pyzbar'),
    ],
    datas=[
        ('app', 'app'),
        ('alembic', 'alembic'),
        ('alembic.ini', '.'),
        ('build', 'build'),
    ],
    hiddenimports=[
        # uvicorn internals (not auto-detected)
        'uvicorn',
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.loops.asyncio',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.http.h11_impl',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        # FastAPI / Starlette
        'fastapi',
        'starlette',
        'starlette.middleware',
        'starlette.middleware.cors',
        # SQLAlchemy
        'sqlalchemy',
        'sqlalchemy.dialects.sqlite',
        'sqlalchemy.dialects.sqlite.pysqlite',
        'sqlalchemy.ext.declarative',
        'sqlalchemy.orm',
        # Pydantic v1
        'pydantic',
        'pydantic.env_settings',
        'pydantic.validators',
        'pydantic.error_wrappers',
        'email_validator',
        # Auth
        'jose',
        'jose.jwt',
        'jose.exceptions',
        'passlib',
        'passlib.context',
        'passlib.handlers',
        'passlib.handlers.bcrypt',
        'passlib.handlers.sha2_crypt',
        'passlib.handlers.pbkdf2',
        # Multipart / file uploads
        'multipart',
        'python_multipart',
        # OpenCV + barcode (pyzbar)
        'cv2',
        'pyzbar',
        'pyzbar.pyzbar',
        # Alembic
        'alembic',
        'alembic.runtime',
        'alembic.runtime.migration',
        'alembic.operations',
        # Misc
        'h11',
        'anyio',
        'anyio.abc',
        'anyio._backends._asyncio',
        'sniffio',
        'click',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Exclude test dependencies to reduce size
        'pytest',
        'faker',
        '_pytest',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='inventory_backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,          # Keep console visible so you see startup logs/errors
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='inventory_backend',
)
