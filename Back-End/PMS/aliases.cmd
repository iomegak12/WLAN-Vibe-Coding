@echo off

doskey r = uvicorn app.main:app --host 0.0.0.0 --port 5002

doskey k = taskkill /F /IM uvicorn.exe

