# Orders Service (NestJS + Hexagonal Architecture)

Serviço de Pedidos desenvolvido em **NestJS**, estruturado em **Arquitetura Hexagonal**, com integração a **MongoDB** e **RabbitMQ** para mensageria de eventos.

---

##  Funcionalidades Principais

-  CRUD de Pedidos
-  Atualização de status via PATCH
-  Publicação de eventos no **RabbitMQ** (`orders.exchange`)
-  Documentação interativa via **Swagger**
-  Testes automatizados com **Jest**


## Run with Docker
```
Subir todos os serviços:
docker compose up -d --build

or
remover todos os serviços:
docker compose down -v
```
Pré-requisitos
- Docker Desktop ou Engine instalado
- Portas livres: `3000`, `27017`, `5672`, `15672`



## Acessar serviços
1. Copy `.env.example` to `.env` e ajustar se necessário.
2. API: http://localhost:3000
3. Swagger: http://localhost:3000/api
4. RabbitMQ management: http://localhost:15672 (guest/guest)

## Executar localmente (sem Docker)
```
npm install
npm run start:dev
```
Banco e RabbitMQ devem estar rodando localmente:
```
docker run -d -p 27017:27017 mongo:6
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management

```
## Rodar Testes
```
npm test
```
Os testes usam Jest e cobrem:

- Casos de uso (create-order, update-status)

- Repositórios (mongo-order.repository)

- Adapters de mensageria (rabbitmq-publisher)

## Endpoints Principais
| Método   | Rota                 | Descrição                                         |
| -------- | -------------------- | ------------------------------------------------- |
| `POST`   | `/orders`            | Cria um novo pedido                               |
| `GET`    | `/orders/:id`        | Retorna detalhes do pedido                        |
| `PATCH`  | `/orders/:id/status` | Atualiza o status do pedido e publica no RabbitMQ |
| `DELETE` | `/orders/:id`        | Exclui um pedido do MongoDB                       |
| `GET`    | `/health`            | Verifica se o serviço está ativo                  |


## Verificando RabbitMQ
- Após criar e atualizar um pedido (PATCH /orders/:id/status),
abra o painel do RabbitMQ → http://localhost:15672

- Vá até Exchanges → orders.exchange
→ verá publicações no tópico order.status.updated

- Se rodar o shipping-consumer, verá as mensagens sendo consumidas:
```
npm run start:consumer
```
ou
```
ts-node src/consumers/shipping-consumer.ts
````

## Fluxo esperado do
1 - Usuário → cria pedido via POST /orders

2 - Sistema → salva no MongoDB

3 - Usuário → altera status via PATCH /orders/:id/status

4 - Sistema → publica evento em RabbitMQ (orders.exchange)

5 - Consumer → lê e processa mensagem (ex.: logística, notificação)

## Tecnologias

NestJS

MongoDB

RabbitMQ

Jest

Pino Logger

Swagger (OpenAPI)

Docker Compose