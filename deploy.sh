## build dev

cp .env .env.production
yarn build
git stash
docker-compose build
docker-compose push

ssh root@45.32.101.219 "
cd bigtreeland-client &&  
git pull &&
docker stack deploy -c docker-compose.yml bigtreeland-client
"

6,ZfDQv(5SxB114!

## build production

yarn build
docker-compose -f docker-compose.release.yml build
docker-compose -f docker-compose.release.yml push

ssh root@207.148.78.106 "
cd bigtreeland-client &&  
git pull &&
docker stack deploy -c docker-compose.release.yml bigtreeland-client
"

q=5R!JDtv*%65so(
