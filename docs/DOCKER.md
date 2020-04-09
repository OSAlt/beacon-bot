---
id: docker
title: Docker
---

# Docker Deployment 

Every succesful build in master creates an image with the tag :latest.  If you need to capture your local changes you'll need to rebuild your image using ```docker-compose build bot```

## Running the bot

The configuration is done via the .env file.  Please copy env-template to .env and update the file accordingly.

## Bring up the bot

```
docker-compose up -d
```

You can see if the bot is doing what it should be doing by running:


```
docker-compose logs -f bot 
```

