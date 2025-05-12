@echo off
REM Script di installazione per CommerceAI Agent (Windows)
echo Iniziando l'installazione di CommerceAI Agent...

REM Creazione ambiente virtuale Python
echo Creazione ambiente virtuale Python...
python -m venv venv
call venv\Scripts\activate.bat

REM Installazione dipendenze backend
echo Installazione dipendenze backend...
pip install -r requirements.txt

REM Installazione dipendenze frontend
echo Installazione dipendenze frontend...
cd frontend
npm install

echo Installazione completata con successo!
echo Per avviare il backend: call venv\Scripts\activate.bat ^&^& uvicorn src.main:app --reload
echo Per avviare il frontend: cd frontend ^&^& npm start
