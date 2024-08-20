FROM public.ecr.aws/docker/library/node:21-alpine as base

WORKDIR /app

COPY package*.json ./

RUN yarn

COPY . .

WORKDIR /app

RUN yarn build 

RUN apk update && apk add --no-cache bash vim

EXPOSE 3000

CMD ["yarn", "serve"]