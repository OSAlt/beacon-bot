FROM node:13.12.0

RUN mkdir /app
COPY . /app

WORKDIR /app
RUN rm -f /app/config-example.js ; \
    cp /app/config-example.js /app/config.js;  \   
    yarn install  && \
    npm install pm2 -g

VOLUME /app
# ENTRYPOINT [ "pm2", "start", "index.js" ]
ENTRYPOINT [ "node",  "index.js" ]
