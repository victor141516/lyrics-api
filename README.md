# Lyrics API


## How to

```sh
docker network create lyrics-api

docker run -d \
    --restart unless-stopped \
    --name lyrics-api-mongo \
    --network lyrics-api \
    -v $(pwd)/data:/data/db \
    mongo

docker run -d \
    --restart unless-stopped \
    --name lyrics-api-mongo-express \
    --network lyrics-api \
    -e ME_CONFIG_MONGODB_SERVER=lyrics-api-mongo \
    mongo-express

docker run -d \
    --restart unless-stopped \
    --name lyrics-api-app \
    --network lyrics-api \
    -e GENIUS_API=xxxxxxxxxxxxxxxxxxxxxxx \
    -e PORT=3000 \
    -e MONGO_URL=mongodb://lyrics-api-mongo:27017 \
    victor141516/lyrics-api
```

Not you have to reverse proxy somehow that `lyrics-api-app` container and expose the port 3000