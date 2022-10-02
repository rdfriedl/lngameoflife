# syntax=docker/dockerfile:1
FROM node:18-alpine

WORKDIR /app
COPY ["package.json", "yarn.lock", "./"]

ENV NODE_ENV=development
RUN yarn install
COPY . .
RUN yarn build

ENV PORT=3000
ENV DISABLE_LN_PAYMENTS="true"
ENV WEBHOOK_DOMAIN="http://localhost:3000"
ENV LNBITS_URL="https://legend.lnbits.com/"
ENV LNBITS_WALLET_ID="changeme"
ENV LNBITS_READ_KEY="changeme"

EXPOSE 3000
RUN yarn install
ENV NODE_ENV=production
CMD ["node", "server/index.js"]
