FROM node:13.12.0

RUN mkdir /app
COPY . /app

WORKDIR /app
RUN yarn install  && \
    npm install pm2 -g


# ENTRYPOINT [ "pm2", "start", "index.js" ]
ENTRYPOINT [ "node",  "index.js" ]
