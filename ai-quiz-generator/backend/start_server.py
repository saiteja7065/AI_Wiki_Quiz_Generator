"""
Start the FastAPI server for development and testing
"""
import uvicorn
import os
import sys

def start_server():
    """Start the FastAPI development server"""
    print("🚀 Starting AI Wiki Quiz Generator API Server...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔄 Auto-reload enabled for development")
    print("\n💡 To test the API, run: python test_fastapi_endpoints.py")
    print("⏹️  Press Ctrl+C to stop the server\n")
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Server failed to start: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_server()