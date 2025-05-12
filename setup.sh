#!/bin/bash

# Script di installazione per CommerceAI Agent
echo "Iniziando l'installazione di CommerceAI Agent..."

# Creazione ambiente virtuale Python
echo "Creazione ambiente virtuale Python..."
python -m venv venv
source venv/bin/activate

# Installazione dipendenze backend
echo "Installazione dipendenze backend..."
pip install -r requirements.txt

# Installazione dipendenze frontend
echo "Installazione dipendenze frontend..."
cd frontend
npm install

echo "Installazione completata con successo!"
echo "Per avviare il backend: source venv/bin/activate && uvicorn src.main:app --reload"
echo "Per avviare il frontend: cd frontend && npm start"
