FROM node:jod-alpine
WORKDIR /app
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY src/ ./src
RUN apk add --no-cache openjdk21-jre-headless libreoffice-writer ttf-liberation
RUN npm install -g npm
RUN npm install
RUN npm run build
ENTRYPOINT [ "npm", "run", "start" ]