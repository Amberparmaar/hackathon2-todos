import gradio as gr
import subprocess
import threading
import time
import os
from server import app as fastapi_app
import uvicorn

# Update the port to use the one provided by Hugging Face
port = int(os.environ.get("PORT", 7860))

def run_fastapi_app():
    """Function to run the FastAPI application"""
    uvicorn.run(fastapi_app, host="0.0.0.0", port=port)

# Start FastAPI in a background thread
thread = threading.Thread(target=run_fastapi_app, daemon=True)
thread.start()

# Simple Gradio interface to keep the space alive
with gr.Blocks(title="Todo API Backend") as demo:
    gr.Markdown("# 📝 Todo API Backend")
    gr.Markdown("FastAPI backend deployed on Hugging Face Spaces")

    with gr.Accordion("API Information", open=True):
        gr.Markdown("""
        ## Available Endpoints:
        - [/docs](/) - Interactive API Documentation
        - [/health](/health) - Health Check
        - [/api/auth/signup](/api/auth/signup) - User Registration
        - [/api/auth/signin](/api/auth/signin) - User Login
        - [/api/tasks](/api/tasks) - Task Management
        """)

    gr.Markdown("### Important Notes:")
    gr.Markdown("- This space may sleep when inactive")
    gr.Markdown("- API endpoints will be available when the space is awake")
    gr.Markdown("- Response times may vary due to cold starts")

# Launch the Gradio app
if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=port)