FROM node:stretch-slim
WORKDIR /app
COPY package.json .
COPY yarn.lock .
COPY src/ ./src
COPY files/ ./files
RUN mkdir /usr/share/man/man1/
RUN echo 'deb http://deb.debian.org/debian stretch-backports main contrib non-free' > /etc/apt/sources.list.d/backports.list
RUN apt-get update && apt-get install -y -t stretch-backports --no-install-recommends default-jre libreoffice-writer ttf-liberation
RUN yarn install
ENTRYPOINT [ "yarn", "start" ]