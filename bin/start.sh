# $NODE_ENV = [main, dev, prerelease]
if [ -f bin/$NODE_ENV.env ]; then
    cp bin/$NODE_ENV.env .env
    nuxt -open
else
    echo not find bin/$NODE_ENV.env
fi