#!/bin/bash

aws ecr get-login-password --region ap-southeast-1 |
  docker login --username AWS --password-stdin 471112833728.dkr.ecr.ap-southeast-1.amazonaws.com

docker build --platform linux/amd64 -t rx-core-ms-auth .

docker tag rx-core-ms-auth:latest 471112833728.dkr.ecr.ap-southeast-1.amazonaws.com/rx-core-ms-auth:latest

docker push 471112833728.dkr.ecr.ap-southeast-1.amazonaws.com/rx-core-ms-auth:latest
