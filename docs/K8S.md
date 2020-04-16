---
id: k8s
title: Kubernetes
---

# Deployment

In the [Kubernetes](../kubernetes) folder are 3 files.
    
    - bot-deployment.yml: Pulls from docker.io for beaconbot image 
    - db-deployment.yml: Deploys a Mysql database for persistent configuration
    - env-configmap.yml: This is where various env variables are configured for the bot (Eg. Bot-token, Channels. Roles, etc)

## Running the bot

The configuration is done via the env-configmap.yml file.  Please copy the file and update accordingly.

## Bring up the bot
The easiest way to bring up the bot is to run Kubectl.

From inside the kubernetes folder run
```
kubectl apply -f env-configmap.yml,db-deployment.yml,bot-deployment.yml
```

To verify that the bot is up and running (You should see 2 pods running with bot-deployment and db-deployment prefixes.):
``` 
kubectl get pods
```

