FROM ghcr.io/puppeteer/puppeteer:19.7.5

USER root

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

CMD [ "npm", "run", "start" ]