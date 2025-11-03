FROM node:jod-trixie
WORKDIR /app
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY src/ ./src
RUN apt-get update && apt-get install -y --no-install-recommends default-jre libreoffice-writer fonts-liberation
RUN npm install -g npm
RUN npm install
RUN npm run build
ENTRYPOINT [ "npm", "run", "start" ]