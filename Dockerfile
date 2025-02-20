FROM node:12-alpine AS builder
RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers autoconf automake make nasm python git && \
  npm install --quiet node-gyp -g
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM node:12-alpine
WORKDIR /app
COPY --from=builder /app /app

ENV NODE_ENV=production
ENV PORT=80

EXPOSE 80

CMD [ "npm", "start" ]
