const express = require('express')
const prometheus = require('prom-client');

const collectDefaultMetrics = prometheus.collectDefaultMetrics;
const register = prometheus.register;
collectDefaultMetrics({register});

const app = express();

const request_total_count = new prometheus.Counter({
    name: 'request_local',
    help: 'Contador de requisições',
    labelNames: ['method', 'statusCode'],
});

const request_time_histogram = new prometheus.Histogram({
    name: 'projeto_request_observality',
    help: 'Tempo de resposta das requisições',
    buckets: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
});

const request_time_summary = new prometheus.Summary({
    name: 'projeto_summary_observality',
    help: 'Tempo de resposta das requisições',
    percentiles: [0.01, 0.05, 0.5, 0.9, 0.95, 0.99, 0.999],
});

const sleep = (ms) => new Promisse((resolve) => setTimeout(resolve, ms));

app.get('/', async function(req, res) {
    const sucess = req.query.sucess == null || req.query.sucess == 'true';
    const statusCode = sucess ? 200 : 500;
    request_total_count.labels({
        method: 'GET', statusCode: statusCode
    }).inc(); // Incrementando em 1 um contador da quantidade de requisições desta rota na aplicação
    const initialTime = Date.now();
    await sleep(100 * Math.random());
    const durationTime = Date.now() - initialTime;
    request_time_histogram.observe(durationTime); // Adicionando o tempo de resposta da requisição para visualização do histogram
    request_time_summary.observe(durationTime); // Adicionando o tempo de resposta da requisição para visualização dos percentis

    res.status(statusCode).json({
        sucess: sucess,
        data: {
            message: `Requisição realizada em ${durationTime}ms.`
        }
    });
});

app.get('/metrics', async function(req, res) {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

app.listen(3000);