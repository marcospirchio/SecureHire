# Dockerfile para desarrollo con npm run dev
FROM node:18

WORKDIR /app

COPY package*.json ./

# Instalación de dependencias con resolución de conflictos
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
