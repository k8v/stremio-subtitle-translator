# Utilise une image Node.js légère
FROM node:lts-alpine

# Définit le répertoire de travail
WORKDIR /app

# Copie les fichiers de dépendances et les installe
COPY package*.json ./
RUN npm install

# Copie le reste du code source
COPY . .

# Expose le port par défaut de l'application (3000)
EXPOSE 3000

# Commande pour démarrer l'add-on
CMD ["npm", "start"]
