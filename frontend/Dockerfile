FROM node:16-alpine

WORKDIR /app

# Copia i file di configurazione
COPY package.json package-lock.json ./

# Installa le dipendenze
RUN npm ci

# Copia il codice sorgente
COPY . .

# Costruisci l'applicazione per la produzione
RUN npm run build

# Installa un server leggero per servire l'applicazione
RUN npm install -g serve

# Espone la porta per il frontend
EXPOSE 3000

# Comando di avvio
CMD ["serve", "-s", "build", "-l", "3000"]
