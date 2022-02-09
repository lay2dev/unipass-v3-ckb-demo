# $NODE_ENV = [main, dev, prerelease]
echo "NODE_ENV = $NODE_ENV"
if [ -f bin/$NODE_ENV.env ]; then
    cp bin/$NODE_ENV.env .env
    nuxt generate
else
    echo not find bin/$NODE_ENV.env
fi