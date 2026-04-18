from fastapi.middleware.cors import CORSMiddleware


def create_cors_middleware(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
        ],  # React dev server ports
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
