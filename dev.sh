#!/bin/bash
# Start blargh in development mode with watch + local server.
# Open http://127.0.0.1:8080 in your browser.
exec blargh --in src --out html --watch --serve 8080
