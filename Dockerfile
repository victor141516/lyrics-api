FROM node:slim as builder

WORKDIR /app
COPY . /app
RUN npm i && npm run build && mv node_modules build/src


FROM node:slim

ENV PORT 3000

WORKDIR /app
COPY --from=builder /app/build/src /app

CMD [ "node", "main.js" ]