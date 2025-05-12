FROM python:3.11-slim

WORKDIR /app

# Installa dipendenze di sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copia i file di requisiti
COPY requirements.txt .

# Installa le dipendenze Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia il codice sorgente
COPY . .

# Espone la porta per l'API
EXPOSE 8000

# Comando di avvio predefinito
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
