import Koa from 'koa';
import marker from 'daemon-command-webpack-plugin/marker';

const app = new Koa();

app.listen(3000, () => {
    marker('Listen port: 8080');
});